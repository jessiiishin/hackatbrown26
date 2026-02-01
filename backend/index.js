// backend/index.js

require('dotenv').config(); // load .env into process.env (must be before config)

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3001;

const config = require('./config');
const db = require('./db');

app.use(bodyParser.json());

// CORS: allow frontend to call the API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- ROUTES ---

// POST /generateCrawl
app.post('/generateCrawl', (req, res) => {
  // Placeholder: Logic to generate crawl based on user input
  // Use config.GOOGLE_PLACES_API_KEY, config.GOOGLE_MAPS_API_KEY
  res.json({ message: 'Crawl generated (placeholder)', data: {} });
});

// POST /adjustCrawl
app.post('/adjustCrawl', async (req, res) => {
  // Simulate receiving adjustment data from frontend
  const adjustment = req.body;
  // Log adjustment to simulated DB
  const logResult = await db.logUserAdjustment(adjustment);
  // Respond as if adjustment was processed
  res.json({ message: 'Crawl adjusted (placeholder)', data: {}, log: logResult });
});

// GET /places
app.get('/places', (req, res) => {
  res.json({ message: 'Places fetched (placeholder)', data: [] });
});

/**
 * GET /places/restaurants?city=New+York&budgetTier=$$
 * Returns 5 restaurants from Google Places API for the given city and price tier ($, $$, $$$).
 * Uses GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) from .env.
 */
app.get('/places/restaurants', async (req, res) => {
  const city = (req.query.city || '').trim();
  const budgetTier = (req.query.budgetTier || '').trim();

  if (!city) {
    return res.status(400).json({ error: 'Query parameter "city" is required' });
  }

  const validTiers = ['$', '$$', '$$$'];
  if (!validTiers.includes(budgetTier)) {
    return res.status(400).json({
      error: 'Query parameter "budgetTier" must be one of: $, $$, $$$',
    });
  }

  const apiKey = config.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return res.status(503).json({
      error: 'Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY in backend .env',
    });
  }

  try {
    const restaurants = await fetchRestaurantsFromPlacesAPI(city, budgetTier, apiKey);
    return res.json({ restaurants });
  } catch (err) {
    console.error('Places API error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch restaurants from Google Places',
      details: err.message,
    });
  }
});

/**
 * GET /places/autocomplete?input=San+Fr
 * Returns city suggestions from Google Places Autocomplete (New) API, restricted to (cities).
 * Uses GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) from .env.
 */
app.get('/places/autocomplete', async (req, res) => {
  const input = (req.query.input || '').trim();
  const apiKey = config.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return res.status(503).json({
      error: 'Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY in backend .env',
    });
  }
  if (!input) {
    return res.json({ suggestions: [] });
  }
  try {
    const url = 'https://places.googleapis.com/v1/places:autocomplete';
    const body = {
      input,
      includedPrimaryTypes: ['(cities)'],
    };
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.text.text',
      },
      body: JSON.stringify(body),
    });
    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      throw new Error(fetchRes.status + ' ' + errText);
    }
    const data = await fetchRes.json();
    const suggestions = (data.suggestions || [])
      .map((s) => s.placePrediction?.text?.text)
      .filter(Boolean);
    return res.json({ suggestions });
  } catch (err) {
    console.error('Places Autocomplete error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch city suggestions',
      details: err.message,
      suggestions: [],
    });
  }
});

/**
 * Geocode a city name to get its viewport (bounds) so we can restrict Places results to that area.
 * Returns { low: { latitude, longitude }, high: { latitude, longitude } } or null.
 */
async function geocodeCity(city, apiKey) {
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;
  const res = await fetch(geocodeUrl);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'OK' || !data.results || data.results.length === 0) return null;
  const first = data.results[0];
  const viewport = first.geometry && first.geometry.viewport;
  if (!viewport || !viewport.southwest || !viewport.northeast) return null;
  return {
    low: {
      latitude: viewport.southwest.lat,
      longitude: viewport.southwest.lng,
    },
    high: {
      latitude: viewport.northeast.lat,
      longitude: viewport.northeast.lng,
    },
  };
}

const tierToPriceLevels = {
  $: ['PRICE_LEVEL_INEXPENSIVE'],
  $$: ['PRICE_LEVEL_MODERATE'],
  $$$: ['PRICE_LEVEL_EXPENSIVE'],
};

/** Minimum rating (out of 5) for restaurants; only places with rating >= this are included. */
const MIN_RATING = 4.2;

/**
 * Calls Google Places API (Text Search). If usePriceFilter is true, request includes priceLevels;
 * otherwise fetches all restaurants in city so we can filter by price in code (fallback when strict filter returns 0).
 * Returns array of places (raw API shape).
 */
async function searchPlaces(city, priceLevels, apiKey, usePriceFilter) {
  const locationRestriction = await geocodeCity(city, apiKey);
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: `restaurants in ${city}`,
    includedType: 'restaurant',
    pageSize: 20,
    ...(locationRestriction && { locationRestriction: { rectangle: locationRestriction } }),
    ...(usePriceFilter && priceLevels.length && { priceLevels }),
  };

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.priceLevel',
    'places.photos',
    'places.rating',
  ].join(',');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Places API ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Fetches up to 5 restaurants in city for the given price tier. If the strict price filter returns 0,
 * retries without the price filter and keeps only places that match the tier so we still show 1–4 when available.
 * Returns array of { id, name, address, lat, lng, priceLevel, image }.
 */
async function fetchRestaurantsFromPlacesAPI(city, budgetTier, apiKey) {
  const priceLevels = tierToPriceLevels[budgetTier];

  let places = await searchPlaces(city, priceLevels, apiKey, true);
  let matching = places.filter((p) => {
    const level = p.priceLevel || '';
    if (!priceLevels.includes(level)) return false;
    const rating = p.rating != null ? Number(p.rating) : null;
    return rating != null && rating >= MIN_RATING;
  });

  // Fallback: retry without price filter so we can filter in code (more results, but API
  // priceLevel can be wrong for some places). Skip fallback for $ (cheapest) to avoid
  // showing misclassified expensive restaurants that appear in the broad "all restaurants" set.
  if (matching.length === 0 && budgetTier !== '$') {
    places = await searchPlaces(city, priceLevels, apiKey, false);
    matching = places.filter((p) => {
      const level = p.priceLevel || '';
      if (!priceLevels.includes(level)) return false;
      const rating = p.rating != null ? Number(p.rating) : null;
      return rating != null && rating >= MIN_RATING;
    });
  }

  const shuffled = matching.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = shuffled.slice(0, 5);

  const results = await Promise.all(
    selected.map(async (p) => {
      let image = null;
      const photoName = p.photos && p.photos[0] && p.photos[0].name;
      if (photoName) {
        try {
          const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&maxHeightPx=600&skipHttpRedirect=true&key=${apiKey}`;
          const photoRes = await fetch(photoUrl);
          if (photoRes.ok) {
            const photoData = await photoRes.json();
            if (photoData.photoUri) image = photoData.photoUri;
          }
        } catch (e) {
          // keep image null, frontend will use placeholder
        }
      }
      return {
        id: p.id || null,
        name: (p.displayName && p.displayName.text) || 'Unknown',
        address: p.formattedAddress || '',
        lat: (p.location && p.location.latitude) ?? null,
        lng: (p.location && p.location.longitude) ?? null,
        priceLevel: p.priceLevel || budgetTier,
        image,
      };
    })
  );

  return results;
}

/**
 * Calls Google Places API (Text Search) for 5 landmarks in city.
 * Fetches a unique photo per landmark via Place Photos API (same as restaurants).
 * Returns array of { id, name, address, lat, lng, image }.
 */
async function fetchLandmarksFromPlacesAPI(city, apiKey) {
  const locationRestriction = await geocodeCity(city, apiKey);
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: `landmarks in ${city}`,
    includedType: 'tourist_attraction',
    pageSize: 5,
    ...(locationRestriction && { locationRestriction: { rectangle: locationRestriction } }),
  };

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.photos',
  ].join(',');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Places API ${response.status}: ${text}`);
  }

  const data = await response.json();
  const places = data.places || [];

  const results = await Promise.all(
    places.map(async (p) => {
      let image = null;
      const photoName = p.photos && p.photos[0] && p.photos[0].name;
      if (photoName) {
        try {
          const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&maxHeightPx=600&skipHttpRedirect=true&key=${apiKey}`;
          const photoRes = await fetch(photoUrl);
          if (photoRes.ok) {
            const photoData = await photoRes.json();
            if (photoData.photoUri) image = photoData.photoUri;
          }
        } catch (e) {
          // keep image null, frontend will use placeholder
        }
      }
      return {
        id: p.id || null,
        name: (p.displayName && p.displayName.text) || 'Unknown',
        address: p.formattedAddress || '',
        lat: (p.location && p.location.latitude) ?? null,
        lng: (p.location && p.location.longitude) ?? null,
        image,
      };
    })
  );

  return results;
}

/**
 * GET /places/landmarks?city=New+York
 * Returns 5 landmarks from Google Places API for the given city.
 */
app.get('/places/landmarks', async (req, res) => {
  const city = (req.query.city || '').trim();

  if (!city) {
    return res.status(400).json({ error: 'Query parameter "city" is required' });
  }

  const apiKey = config.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return res.status(503).json({
      error: 'Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY in backend .env',
    });
  }

  try {
    const landmarks = await fetchLandmarksFromPlacesAPI(city, apiKey);
    return res.json({ landmarks });
  } catch (err) {
    console.error('Places API error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch landmarks from Google Places',
      details: err.message,
    });
  }
});

/** Estimated visit time in minutes per stop type */
const EST_RESTAURANT_MINUTES = 45;
const EST_LANDMARK_MINUTES = 30;
const MAX_STOPS = 10;

/**
 * Parse "09:00 AM" / "12:00 PM" to minutes since midnight.
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(/\s+/);
  const period = (parts[1] || '').toUpperCase();
  const [h, m] = (parts[0] || '0:0').split(':').map(Number);
  let hours = h || 0;
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + (m || 0);
}

/**
 * Get walking duration matrix (minutes) between all pairs of places.
 * places: Array<{ lat, lng }> with valid lat/lng.
 * Returns 2D array: durationMinutes[i][j] = walking minutes from i to j, or Infinity if unavailable.
 */
async function getWalkingDurationMatrix(places, apiKey) {
  const n = places.length;
  const durationMinutes = Array.from({ length: n }, () => Array(n).fill(Infinity));
  if (n === 0) return durationMinutes;

  const points = places.map((p) => `${p.lat},${p.lng}`);
  const origins = points.join('|');
  const destinations = origins;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=walking&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return durationMinutes;
  const data = await res.json();
  if (data.status !== 'OK' || !data.rows) return durationMinutes;

  for (let i = 0; i < data.rows.length && i < n; i++) {
    const row = data.rows[i].elements || [];
    for (let j = 0; j < row.length && j < n; j++) {
      const el = row[j];
      if (el.status === 'OK' && el.duration && el.duration.value != null) {
        durationMinutes[i][j] = Math.ceil(el.duration.value / 60);
      }
    }
  }
  return durationMinutes;
}

/**
 * Build a time-constrained itinerary: food and landmarks, alternating, using walking ETA and estimated visit time.
 * totalMinutes: max total time (walking + visit).
 * Returns { orderedStops, walkingMinutesBetween, totalWalkingMinutes, totalVisitMinutes }.
 */
function buildTimeConstrainedItinerary(restaurants, landmarks, totalMinutes, durationMinutes) {
  const restIndices = restaurants.map((_, i) => ({ type: 'restaurant', index: i, estMinutes: EST_RESTAURANT_MINUTES }));
  const landIndices = landmarks.map((_, i) => ({ type: 'landmark', index: i, estMinutes: EST_LANDMARK_MINUTES }));
  const allPlaces = [...restaurants, ...landmarks];
  const nRest = restaurants.length;
  const nLand = landmarks.length;
  const getMatrixIndex = (type, index) => (type === 'restaurant' ? index : nRest + index);

  const orderedStops = [];
  const walkingMinutesBetween = [];
  let totalWalking = 0;
  let totalVisit = 0;
  let currentMatrixIndex = null;
  const usedRest = new Set();
  const usedLand = new Set();

  const remaining = () => ({
    restaurants: restIndices.filter((r) => !usedRest.has(r.index)),
    landmarks: landIndices.filter((l) => !usedLand.has(l.index)),
  });

  const pickFirst = () => {
    if (restIndices.length > 0) {
      const r = restIndices[0];
      usedRest.add(r.index);
      currentMatrixIndex = getMatrixIndex('restaurant', r.index);
      orderedStops.push({ type: 'restaurant', place: restaurants[r.index], estMinutes: r.estMinutes });
      totalVisit += r.estMinutes;
      return true;
    }
    if (landIndices.length > 0) {
      const l = landIndices[0];
      usedLand.add(l.index);
      currentMatrixIndex = getMatrixIndex('landmark', l.index);
      orderedStops.push({ type: 'landmark', place: landmarks[l.index], estMinutes: l.estMinutes });
      totalVisit += l.estMinutes;
      return true;
    }
    return false;
  };

  if (!pickFirst()) return { orderedStops: [], walkingMinutesBetween: [], totalWalkingMinutes: 0, totalVisitMinutes: 0 };

  let wantRestaurant = false;
  while (orderedStops.length < MAX_STOPS) {
    const { restaurants: availRest, landmarks: availLand } = remaining();
    const candidates = wantRestaurant ? availRest : availLand;
    if (candidates.length === 0) {
      wantRestaurant = !wantRestaurant;
      if ((wantRestaurant ? availRest : availLand).length === 0) break;
      continue;
    }

    let best = null;
    let bestWalk = Infinity;
    for (const c of candidates) {
      const nextIdx = getMatrixIndex(c.type, c.index);
      const walk = durationMinutes[currentMatrixIndex][nextIdx];
      const newTotal = totalWalking + walk + totalVisit + c.estMinutes;
      if (newTotal <= totalMinutes && walk < bestWalk) {
        bestWalk = walk;
        best = c;
      }
    }
    if (best == null) break;

    totalWalking += bestWalk;
    walkingMinutesBetween.push(bestWalk);
    totalVisit += best.estMinutes;
    if (best.type === 'restaurant') usedRest.add(best.index);
    else usedLand.add(best.index);
    currentMatrixIndex = getMatrixIndex(best.type, best.index);
    orderedStops.push({
      type: best.type,
      place: best.type === 'restaurant' ? restaurants[best.index] : landmarks[best.index],
      estMinutes: best.estMinutes,
    });
    wantRestaurant = !wantRestaurant;
  }

  return {
    orderedStops,
    walkingMinutesBetween,
    totalWalkingMinutes: totalWalking,
    totalVisitMinutes: totalVisit,
  };
}

/**
 * POST /itinerary
 * Body: { city, budgetTier, startTime, endTime }
 * Returns time-constrained crawl: stops (food + landmarks), walking ETAs, estimated visit times, so total <= (endTime - startTime).
 * Uses Distance Matrix API (walking) for ETA between stops.
 */
app.post('/itinerary', async (req, res) => {
  const { city, budgetTier, startTime, endTime } = req.body || {};
  const startM = parseTimeToMinutes(startTime);
  const endM = parseTimeToMinutes(endTime);
  let totalMinutes = endM > startM ? endM - startM : 24 * 60 - startM + endM;
  if (totalMinutes <= 0) totalMinutes = 3 * 60;

  const apiKey = config.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    return res.status(503).json({
      error: 'Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY in backend .env',
    });
  }

  const validTiers = ['$', '$$', '$$$'];
  if (!validTiers.includes(budgetTier)) {
    return res.status(400).json({ error: 'budgetTier must be one of: $, $$, $$$' });
  }
  if (!city || !city.trim()) {
    return res.status(400).json({ error: 'city is required' });
  }

  try {
    const [restaurantsRaw, landmarksRaw] = await Promise.all([
      fetchRestaurantsFromPlacesAPI(city.trim(), budgetTier, apiKey),
      fetchLandmarksFromPlacesAPI(city.trim(), apiKey),
    ]);

    const restaurants = (restaurantsRaw || []).filter((r) => r.lat != null && r.lng != null);
    const landmarks = (landmarksRaw || []).filter((l) => l.lat != null && l.lng != null);
    const allPlaces = [...restaurants, ...landmarks];
    if (allPlaces.length === 0) {
      return res.status(200).json({
        stops: [],
        walkingMinutesBetween: [],
        totalWalkingMinutes: 0,
        totalVisitMinutes: 0,
        route: '',
        budgetTier,
      });
    }

    const durationMinutes = await getWalkingDurationMatrix(allPlaces, apiKey);
    const { orderedStops, walkingMinutesBetween, totalWalkingMinutes, totalVisitMinutes } = buildTimeConstrainedItinerary(
      restaurants,
      landmarks,
      totalMinutes,
      durationMinutes
    );

    const pricePerStop = budgetTier === '$' ? 15 : budgetTier === '$$' ? 40 : 80;
    const placeholderRest = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    const placeholderLand = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800';

    const stops = orderedStops.map((s, i) => {
      const p = s.place;
      const isRest = s.type === 'restaurant';
      return {
        id: p.id || `place-${i}-${p.name.replace(/\s/g, '-')}`,
        name: p.name,
        type: s.type,
        description: `${p.name} in ${city}`,
        price: isRest ? Math.round(pricePerStop / 5) : 0,
        duration: s.estMinutes,
        address: p.address || '',
        dietaryOptions: [],
        image: (p.image && p.image.trim()) ? p.image : isRest ? placeholderRest : placeholderLand,
        openTime: isRest ? '09:00' : '',
        closeTime: isRest ? '22:00' : '',
        lat: p.lat,
        lng: p.lng,
        priceTier: isRest ? budgetTier : undefined,
        walkingMinutesToNext: i < orderedStops.length - 1 && walkingMinutesBetween[i] != null ? walkingMinutesBetween[i] : undefined,
      };
    });

    const route = stops.map((s, i) => (i === 0 ? `Start at ${s.name}` : `→ ${s.name}`)).join(' ');

    return res.json({
      stops,
      walkingMinutesBetween,
      totalWalkingMinutes,
      totalVisitMinutes,
      totalTime: totalVisitMinutes + totalWalkingMinutes,
      route,
      budgetTier,
    });
  } catch (err) {
    console.error('Itinerary error:', err.message);
    return res.status(502).json({
      error: 'Failed to build itinerary',
      details: err.message,
    });
  }
});

// Placeholder: Logging user adjustments
function logUserAdjustment(adjustment) {
  // TODO: Store adjustment in PostgreSQL (user adjustments table)
  console.log('User adjustment logged:', adjustment);
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

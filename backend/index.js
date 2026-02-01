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
 * Returns 5 restaurants from Google Places API for the given city and price tier ($, $$, $$$, $$$$).
 * Uses GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) from .env.
 */
app.get('/places/restaurants', async (req, res) => {
  const city = (req.query.city || '').trim();
  const budgetTier = (req.query.budgetTier || '').trim();

  if (!city) {
    return res.status(400).json({ error: 'Query parameter "city" is required' });
  }

  const validTiers = ['$', '$$', '$$$', '$$$$'];
  if (!validTiers.includes(budgetTier)) {
    return res.status(400).json({
      error: 'Query parameter "budgetTier" must be one of: $, $$, $$$, $$$$',
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
  $$$$: ['PRICE_LEVEL_EXPENSIVE'],
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

  if (matching.length === 0) {
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


// Placeholder: Logging user adjustments
function logUserAdjustment(adjustment) {
  // TODO: Store adjustment in PostgreSQL (user adjustments table)
  console.log('User adjustment logged:', adjustment);
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

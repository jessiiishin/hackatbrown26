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

/**
 * Calls Google Places API (Text Search) for 5 restaurants in city with given price tier.
 * Returns array of { id, name, address, lat, lng, priceLevel }.
 */
async function fetchRestaurantsFromPlacesAPI(city, budgetTier, apiKey) {
  const tierToPriceLevels = {
    $: ['PRICE_LEVEL_INEXPENSIVE'],
    $$: ['PRICE_LEVEL_MODERATE'],
    $$$: ['PRICE_LEVEL_EXPENSIVE'],
    $$$$: ['PRICE_LEVEL_EXPENSIVE'], // API may not have VERY_EXPENSIVE; use EXPENSIVE for $$$$
  };
  const priceLevels = tierToPriceLevels[budgetTier];

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: `restaurants in ${city}`,
    includedType: 'restaurant',
    priceLevels,
    pageSize: 5,
  };

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.priceLevel',
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

  const matching = places.filter((p) => {
    const level = p.priceLevel || '';
    return priceLevels.includes(level);
  });

  return matching.map((p) => ({
    id: p.id || null,
    name: (p.displayName && p.displayName.text) || 'Unknown',
    address: p.formattedAddress || '',
    lat: (p.location && p.location.latitude) ?? null,
    lng: (p.location && p.location.longitude) ?? null,
    priceLevel: p.priceLevel || budgetTier,
  }));
}

/**
 * Calls Google Places API (Text Search) for 5 landmarks in city.
 * Returns array of { id, name, address, lat, lng }.
 */
async function fetchLandmarksFromPlacesAPI(city, apiKey) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: `landmarks in ${city}`,
    includedType: 'tourist_attraction',
    pageSize: 5,
  };

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.location',
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

  return places.map((p) => ({
    id: p.id || null,
    name: (p.displayName && p.displayName.text) || 'Unknown',
    address: p.formattedAddress || '',
    lat: (p.location && p.location.latitude) ?? null,
    lng: (p.location && p.location.longitude) ?? null,
  }));
}

// Placeholder: Logging user adjustments
function logUserAdjustment(adjustment) {
  // TODO: Store adjustment in PostgreSQL (user adjustments table)
  console.log('User adjustment logged:', adjustment);
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

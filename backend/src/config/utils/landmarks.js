// backend/src/config/utils/landmarks.js
// Implements landmark discovery and filtering logic per PRD

const axios = require('axios');
const config = require('../../../config');

// In-memory cache for demo (replace with DB or Redis in prod)
const placeDetailsCache = {};

// Helper: Geocode city to get lat/lng and bounds
async function geocodeCity(city) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;
  const params = { address: city, key: config.GOOGLE_MAPS_API_KEY };
  const { data } = await axios.get(url, { params });
  if (!data.results.length) throw new Error('City not found');
  const result = data.results[0];
  return {
    center: result.geometry.location,
    bounds: result.geometry.viewport,
  };
}

// Helper: Search for landmarks near city center
async function searchLandmarks(center, radius = 5000) {
  const types = [
    'tourist_attraction', 'museum', 'park',
    'church', 'synagogue', 'mosque', 'point_of_interest',
  ];
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
  const params = {
    location: `${center.lat},${center.lng}`,
    radius,
    type: types.join('|'),
    key: config.GOOGLE_MAPS_API_KEY,
    rankby: 'prominence',
  };
  const { data } = await axios.get(url, { params });
  return data.results;
}

// Helper: Get place details (with cache)
async function getPlaceDetails(place_id) {
  if (placeDetailsCache[place_id]) return placeDetailsCache[place_id];
  const url = `https://maps.googleapis.com/maps/api/place/details/json`;
  const params = {
    place_id,
    key: config.GOOGLE_MAPS_API_KEY,
    fields: 'name,geometry,opening_hours,price_level,types,rating,formatted_address,photos',
  };
  const { data } = await axios.get(url, { params });
  placeDetailsCache[place_id] = data.result;
  return data.result;
}

// Helper: Check if landmark is open during user window
function isOpenDuringWindow(opening_hours, visitDate, timeStart, timeEnd) {
  if (!opening_hours || !opening_hours.periods) return 'unknown';
  const weekday = new Date(visitDate).getDay(); // 0=Sunday
  const periods = opening_hours.periods.filter(p => p.open.day === weekday);
  if (!periods.length) return 'unknown';
  // Convert times to minutes
  const toMins = t => parseInt(t.substr(0,2))*60 + parseInt(t.substr(2,2));
  const userStart = toMins(timeStart);
  const userEnd = toMins(timeEnd);
  for (const p of periods) {
    const open = toMins(p.open.time);
    const close = p.close ? toMins(p.close.time) : 1440;
    // Handle overnight
    if (close < open) {
      if ((userStart >= open && userStart <= 1439) || (userEnd >= 0 && userEnd <= close)) return 'open';
    } else {
      if (userStart < close && userEnd > open) return 'open';
    }
  }
  return 'closed';
}

// Helper: Price badge
function priceBadge(price_level) {
  if (price_level === undefined) return 'Unknown';
  if (price_level === 0) return 'Free';
  if (price_level === 1) return '$';
  if (price_level === 2) return '$$';
  if (price_level === 3) return '$$$';
  if (price_level === 4) return '$$$$';
  return 'Unknown';
}

// Main: Landmark discovery and filtering
async function getEligibleLandmarks({ city, visitDate, timeStart, timeEnd, budget }) {
  const { center } = await geocodeCity(city);
  const candidates = await searchLandmarks(center);
  // Limit Place Details API calls for cost control
  const topCandidates = candidates.slice(0, 15);
  const results = [];
  for (const c of topCandidates) {
    const details = await getPlaceDetails(c.place_id);
    // Opening hours logic
    const openStatus = isOpenDuringWindow(details.opening_hours, visitDate, timeStart, timeEnd);
    // Price logic
    let priceOk = true;
    if (details.price_level !== undefined && budget !== undefined) {
      priceOk = details.price_level <= budget;
    }
    // Eligibility
    if ((openStatus === 'open' || openStatus === 'unknown') && (priceOk || details.price_level === undefined)) {
      results.push({
        name: details.name,
        address: details.formatted_address,
        coordinates: details.geometry.location,
        open_status: openStatus === 'unknown' ? 'Unknown' : `Open ${timeStart}-${timeEnd}`,
        price: priceBadge(details.price_level),
        price_level: details.price_level,
        rating: details.rating,
        types: details.types,
        place_id: c.place_id,
        photo_url: details.photos && details.photos.length > 0
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0].photo_reference}&key=${config.GOOGLE_MAPS_API_KEY}`
          : '',
        openTime: details.opening_hours && details.opening_hours.periods && details.opening_hours.periods[0] ? details.opening_hours.periods[0].open.time : '',
        closeTime: details.opening_hours && details.opening_hours.periods && details.opening_hours.periods[0] && details.opening_hours.periods[0].close ? details.opening_hours.periods[0].close.time : '',
      });
    }
  }
  return results;
}

module.exports = { getEligibleLandmarks };

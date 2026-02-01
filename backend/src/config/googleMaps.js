const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_URL = 'https://places.googleapis.com/v1/places';
const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Warning: Google Maps API key is not set (process.env.BACKEND_KEY or process.env.GOOGLE_MAPS_API_KEY)');
}

// Common headers for new Places API (v1)
const getPlacesHeaders = (fieldMask = '*') => ({
  'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
  'Content-Type': 'application/json',
  'X-Goog-FieldMask': fieldMask,
});

/**
 * Search for a restaurant by name and location using new Places API
 */
async function searchRestaurant(restaurantName, city) {
  try {
    if (!GOOGLE_MAPS_API_KEY) throw new Error('Google Maps API key not configured');

    const query = `${restaurantName} restaurant in ${city}`;
    console.debug('Places TextSearch query:', query);

    const response = await axios.post(
      `${PLACES_API_URL}:searchText`,
      {
        textQuery: query,
        maxResultCount: 1,
      },
      {
        headers: getPlacesHeaders('places.displayName,places.formattedAddress,places.location,places.rating,places.types,places.name'),
      }
    );

    if (!response.data.places || response.data.places.length === 0) {
      return null;
    }

    const restaurant = response.data.places[0];
    return {
      placeId: restaurant.name, // In new API, name is the place ID like "places/ChIJIQBpAG2ahYAR_6128GltTXQ"
      displayName: restaurant.displayName?.text || restaurant.name,
      location: restaurant.location,
      formattedAddress: restaurant.formattedAddress,
      rating: restaurant.rating,
      types: restaurant.types,
    };
  } catch (error) {
    console.error('Error searching restaurant:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get restaurant details including open/close times using new Places API
 */
async function getRestaurantDetails(placeId) {
  try {
    if (!GOOGLE_MAPS_API_KEY) throw new Error('Google Maps API key not configured');

    // PlaceId format: "places/ChIJ..." - need to construct URL properly
    const url = `${PLACES_API_URL}/${encodeURIComponent(placeId)}`;
    console.debug(`Fetching details for: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.openingHours,places.location,places.websiteUri,places.phoneNumber,places.reviews',
      },
    });

    const details = response.data || {};
    return {
      name: details.displayName?.text || details.name,
      address: details.formattedAddress,
      rating: details.rating,
      openingHours: details.openingHours,
      websiteUri: details.websiteUri,
      phoneNumber: details.phoneNumber,
      location: details.location,
    };
  } catch (error) {
    console.error('Error getting restaurant details for', placeId, ':', error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check if a restaurant is open at a specific time
 */
async function isRestaurantOpen(placeId, dateTime) {
  try {
    const details = await getRestaurantDetails(placeId);

    if (!details.openingHours || !details.openingHours.periods) {
      return { isOpen: null, message: 'Opening hours not available' };
    }

    const date = new Date(dateTime);
    const dayOfWeek = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const currentTime = hours * 100 + minutes; // Convert to 24-hour format (e.g., 1430 for 2:30 PM)

    const periods = details.openingHours.periods;
    for (const period of periods) {
      const openDay = period.open.day;
      const closeDay = period.close?.day;
      const openTime = parseInt(period.open.time, 10);
      const closeTime = parseInt(period.close?.time || '2359', 10);

      if (openDay === dayOfWeek) {
        if (openTime <= currentTime && currentTime < closeTime) {
          return { isOpen: true, openingHours: details.openingHours };
        }
      }
    }

    return { isOpen: false, openingHours: details.openingHours };
  } catch (error) {
    console.error('Error checking if restaurant is open:', error.response?.data || error.message);
    throw error;
  }
}

// Robust enhanced details helper — returns { estimatedDuration, ...rawDetails }
async function getEnhancedPlaceDetails(placeId) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('getEnhancedPlaceDetails: missing API key');
    return { estimatedDuration: 45 };
  }

  // Places v1 place endpoint (consistent with other calls in this module)
  const url = `${PLACES_API_URL}/${encodeURIComponent(placeId)}`;
  try {
    const response = await axios.get(url, {
      headers: getPlacesHeaders('places.name,places.rating,places.userRatingsTotal,places.user_ratings_total,places.priceLevel,places.price_level,places.types'),
    });

    const raw = response && response.data ? response.data : null;

    // Try common locations where place details might live across API versions
    let details = null;
    if (raw) {
      if (raw.result) details = raw.result;
      else if (raw.place) details = raw.place;
      else if (Array.isArray(raw.places) && raw.places.length > 0) details = raw.places[0];
      else details = raw;
    }

    if (!details) {
      console.warn('getEnhancedPlaceDetails: empty response for', placeId, raw);
      return { estimatedDuration: 45 };
    }

    const types = details.types || details.type || (details.places && details.places.types) || null;
    const priceLevel = (typeof details.priceLevel !== 'undefined') ? details.priceLevel : details.price_level;
    const userRatings = (typeof details.userRatingsTotal !== 'undefined') ? details.userRatingsTotal : details.user_ratings_total;

    // Default minutes
    let estimatedMinutes = 45;

    if (Array.isArray(types) && (types.includes('bakery') || types.includes('cafe') || types.includes('fast_food') || types.includes('dessert'))) {
      estimatedMinutes = 30;
    } else if (typeof priceLevel === 'number') {
      if (priceLevel >= 3) estimatedMinutes = 100;
      else if (priceLevel === 2) estimatedMinutes = 75;
      else estimatedMinutes = 45;
    } else if (typeof priceLevel === 'string') {
      const up = priceLevel.toUpperCase();
      if (up.includes('EXPENSIVE')) estimatedMinutes = 100;
      else if (up.includes('MODERATE')) estimatedMinutes = 75;
      else estimatedMinutes = 45;
    }

    if (typeof userRatings === 'number' && userRatings > 2000) {
      estimatedMinutes += 15;
    }

    return { ...(details || {}), estimatedDuration: estimatedMinutes };
  } catch (err) {
    console.warn('getEnhancedPlaceDetails failed for', placeId, err && (err.response?.data || err.message));
    return { estimatedDuration: 45 };
  }
}

/**
 * Get travel time and distance between two locations
 */
async function getTravelTime(origin, destination, mode = 'walking') {
  try {
    if (!GOOGLE_MAPS_API_KEY) throw new Error('Google Maps API key not configured');

    const response = await axios.get(DIRECTIONS_API_URL, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const status = response.data.status;
    if (status && status !== 'OK') {
      const errMsg = response.data.error_message || `Directions API status: ${status}`;
      console.error('Directions API error:', errMsg);
      throw new Error(errMsg);
    }

    if (!response.data.routes || response.data.routes.length === 0) {
      return null;
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      distance: {
        text: leg.distance.text,
        value: leg.distance.value, // in meters
      },
      duration: {
        text: leg.duration.text,
        value: leg.duration.value, // in seconds
      },
      durationInMinutes: Math.ceil(leg.duration.value / 60),
    };
  } catch (error) {
    console.error('Error getting travel time:', error.response && error.response.data ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  searchRestaurant,
  getRestaurantDetails,
  isRestaurantOpen,
  getTravelTime,
  // getEnhancedPlaceDetails,
};

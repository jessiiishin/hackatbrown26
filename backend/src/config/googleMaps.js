const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.BACKEND_KEY || process.env.GOOGLE_MAPS_API_KEY;
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

// Inside googleMaps.js

async function getEnhancedPlaceDetails(placeId) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json`;
  
  const response = await axios.get(url, {
    params: {
      place_id: placeId,
      fields: 'name,rating,user_ratings_total,price_level,type',
      key: apiKey
    }
  });

  const details = response.data.result;
  
  // LOGIC: Estimate stay duration
  // Quick Service/Cafe: 30-45 mins
  // Casual Dining ($$): 60-75 mins
  // Fine Dining ($$$+): 90-120 mins
  let estimatedMinutes = 45; // Default

  if (details.types.includes('bakery') || details.types.includes('cafe') || details.types.includes('fast_food') || details.types.includes('dessert')) {
    estimatedMinutes = 30;
  } else if (details.price_level >= 3) {
    estimatedMinutes = 100; 
  } else if (details.price_level === 2) {
    estimatedMinutes = 75;
  }

  // Add a "Popularity Buffer": If a place has > 2000 reviews, add 15 mins for the wait
  if (details.user_ratings_total > 2000) {
    estimatedMinutes += 15;
  }

  return { ...details, estimatedDuration: estimatedMinutes };
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
  getEnhancedPlaceDetails,
};

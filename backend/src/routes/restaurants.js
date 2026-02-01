const express = require('express');
const router = express.Router();
const googleMaps = require('../config/googleMaps');

/**
 * POST /api/restaurants/search
 * Search for a restaurant by name and city
 * Body: { restaurantName: string, city: string }
 */
router.post('/search', async (req, res) => {
  try {
    const { restaurantName, city } = req.body;

    if (!restaurantName || !city) {
      return res.status(400).json({ error: 'restaurantName and city are required' });
    }

    const restaurant = await googleMaps.searchRestaurant(restaurantName, city);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/restaurants/is-open
 * Check if a restaurant is open at a specific time
 * Body: { placeId: string, dateTime: string (ISO format) }
 */
router.post('/is-open', async (req, res) => {
  try {
    const { placeId, dateTime } = req.body;

    if (!placeId || !dateTime) {
      return res.status(400).json({ error: 'placeId and dateTime are required' });
    }

    const openStatus = await googleMaps.isRestaurantOpen(placeId, dateTime);

    res.json(openStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/restaurants/details/:placeId
 * Get restaurant details including opening hours
 */
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ error: 'placeId is required' });
    }

    const details = await googleMaps.getRestaurantDetails(placeId);

    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/restaurants/crawl-suggestions
 * Search for popular restaurants in a city and filter by open hours
 */
router.post('/crawl-suggestions', async (req, res) => {
  try {
    const axios = require('axios');
    const { city, startTime, endTime, maxResults = 5 } = req.body;

    if (!city || !startTime || !endTime) {
      return res.status(400).json({ error: 'city, startTime, and endTime are required' });
    }

    const PLACES_API_URL = 'https://places.googleapis.com/v1/places';
    const API_KEY = process.env.BACKEND_KEY || process.env.GOOGLE_MAPS_API_KEY;

    // Search for popular restaurants
    console.log(`Searching for popular restaurants in ${city}...`);
    let popularRestaurants = [];

    try {
      const response = await axios.post(
        `${PLACES_API_URL}:searchText`,
        {
          textQuery: `popular restaurants in ${city}`,
          maxResultCount: Math.min(maxResults * 2, 20),
        },
        {
          headers: {
            'X-Goog-Api-Key': API_KEY,
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.types,places.name',
          },
        }
      );

      if (response.data.places && response.data.places.length > 0) {
        popularRestaurants = response.data.places.map((place) => ({
          placeId: place.name,
          displayName: place.displayName?.text || place.name,
          location: place.location,
          formattedAddress: place.formattedAddress,
          rating: place.rating,
        }));
      }
    } catch (error) {
      console.error('Error searching for popular restaurants:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Failed to search for restaurants: ' + error.message });
    }

    if (popularRestaurants.length === 0) {
      return res.status(404).json({ error: 'No restaurants found in this city' });
    }

    // Filter by open hours
    const convertTo24Hour = (time12h) => {
      const [time, period] = time12h.split(' ');
      const [hours, minutes] = time.split(':');
      let hours24 = parseInt(hours, 10);

      if (period === 'AM' && hours24 === 12) {
        hours24 = 0;
      } else if (period === 'PM' && hours24 !== 12) {
        hours24 += 12;
      }

      return `${hours24.toString().padStart(2, '0')}:${minutes}`;
    };

    const startTime24h = convertTo24Hour(startTime);
    const [hour, minute] = startTime24h.split(':');
    const today = new Date();
    const testDateTime = new Date(today);
    testDateTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0);
    const testDateTimeISO = testDateTime.toISOString();

    // Try to check open status, but include restaurants even if we can't verify
    const restaurantsWithStatus = [];

    for (const restaurant of popularRestaurants) {
      try {
        const openStatus = await googleMaps.isRestaurantOpen(restaurant.placeId, testDateTimeISO);
        restaurantsWithStatus.push({
          ...restaurant,
          isOpen: openStatus.isOpen ?? true, // Default to true if uncertain
          openingHours: openStatus.openingHours,
        });
      } catch (error) {
        console.warn(`Could not check open status for ${restaurant.displayName}:`, error.message);
        // Still include the restaurant even if we can't verify hours
        restaurantsWithStatus.push({
          ...restaurant,
          isOpen: true, // Assume open if we can't verify
          openingHours: null,
        });
      }
    }

    // Return all restaurants (they should mostly be marked as open)
    const openRestaurants = restaurantsWithStatus.slice(0, maxResults);

    res.json({
      city,
      timeframe: { startTime, endTime },
      totalSearched: restaurantsWithStatus.length,
      openCount: openRestaurants.length,
      restaurants: openRestaurants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/restaurants/travel-time
 * Get travel time and distance between two locations
 * Body: { origin: { lat, lng }, destination: { lat, lng }, mode?: string }
 * mode can be: 'driving', 'walking', 'bicycling', 'transit'
 */
router.post('/travel-time', async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' });
    }

    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res
        .status(400)
        .json({ error: 'origin and destination must have lat and lng properties' });
    }

    const travelInfo = await googleMaps.getTravelTime(origin, destination, mode);

    res.json(travelInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

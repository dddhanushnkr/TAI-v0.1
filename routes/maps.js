const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const axios = require('axios');

// Get destination information
router.get('/destination/:name', optionalAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const encodedName = encodeURIComponent(name);

    // Use Google Places API to get destination information
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: name,
        key: process.env.GOOGLE_MAPS_API_KEY,
        fields: 'place_id,name,formatted_address,geometry,rating,photos,types'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(404).json({
        error: 'Destination not found',
        message: response.data.status
      });
    }

    const place = response.data.results[0];
    
    // Get additional details
    const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: place.place_id,
        key: process.env.GOOGLE_MAPS_API_KEY,
        fields: 'name,formatted_address,geometry,rating,photos,reviews,opening_hours,website,formatted_phone_number'
      }
    });

    const destinationInfo = {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
      rating: place.rating,
      photos: place.photos?.map(photo => ({
        photoReference: photo.photo_reference,
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      })),
      types: place.types,
      details: detailsResponse.data.result
    };

    res.json({
      success: true,
      destination: destinationInfo
    });

  } catch (error) {
    console.error('Error getting destination info:', error);
    res.status(500).json({
      error: 'Failed to get destination information',
      message: error.message
    });
  }
});

// Get weather information
router.get('/weather', optionalAuth, async (req, res) => {
  try {
    const { destination, date } = req.query;

    if (!destination) {
      return res.status(400).json({
        error: 'Destination is required'
      });
    }

    // Get coordinates for the destination
    const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: destination,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (geocodeResponse.data.status !== 'OK') {
      return res.status(404).json({
        error: 'Destination not found'
      });
    }

    const location = geocodeResponse.data.results[0].geometry.location;

    // Get weather data
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weatherData = {
      location: {
        name: destination,
        coordinates: location
      },
      current: weatherResponse.data.list[0],
      forecast: weatherResponse.data.list.slice(0, 8), // Next 24 hours
      city: weatherResponse.data.city
    };

    res.json({
      success: true,
      weather: weatherData
    });

  } catch (error) {
    console.error('Error getting weather info:', error);
    res.status(500).json({
      error: 'Failed to get weather information',
      message: error.message
    });
  }
});

// Search places
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { query, location, type, radius = 5000 } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    const params = {
      query,
      key: process.env.GOOGLE_MAPS_API_KEY,
      fields: 'place_id,name,formatted_address,geometry,rating,photos,types'
    };

    if (location) {
      params.location = location;
      params.radius = radius;
    }

    if (type) {
      params.type = type;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        error: 'Search failed',
        message: response.data.status
      });
    }

    const places = response.data.results.map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
      rating: place.rating,
      photos: place.photos?.map(photo => ({
        photoReference: photo.photo_reference,
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      })),
      types: place.types
    }));

    res.json({
      success: true,
      places,
      total: response.data.results.length
    });

  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({
      error: 'Failed to search places',
      message: error.message
    });
  }
});

// Get place details
router.get('/place/:placeId', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
        fields: 'name,formatted_address,geometry,rating,photos,reviews,opening_hours,website,formatted_phone_number,price_level,types'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(404).json({
        error: 'Place not found',
        message: response.data.status
      });
    }

    const place = response.data.result;

    res.json({
      success: true,
      place: {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: place.geometry.location,
        rating: place.rating,
        priceLevel: place.price_level,
        photos: place.photos?.map(photo => ({
          photoReference: photo.photo_reference,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        })),
        reviews: place.reviews,
        openingHours: place.opening_hours,
        website: place.website,
        phone: place.formatted_phone_number,
        types: place.types
      }
    });

  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({
      error: 'Failed to get place details',
      message: error.message
    });
  }
});

// Calculate route
router.post('/route', optionalAuth, async (req, res) => {
  try {
    const { origin, destination, mode = 'driving', waypoints } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Origin and destination are required'
      });
    }

    const params = {
      origin,
      destination,
      mode,
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (waypoints && waypoints.length > 0) {
      params.waypoints = waypoints.join('|');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        error: 'Route calculation failed',
        message: response.data.status
      });
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    const routeInfo = {
      distance: leg.distance,
      duration: leg.duration,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location
      })),
      overviewPolyline: route.overview_polyline.points
    };

    res.json({
      success: true,
      route: routeInfo
    });

  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({
      error: 'Failed to calculate route',
      message: error.message
    });
  }
});

// Get nearby places
router.get('/nearby', optionalAuth, async (req, res) => {
  try {
    const { location, type, radius = 5000, keyword } = req.query;

    if (!location || !type) {
      return res.status(400).json({
        error: 'Location and type are required'
      });
    }

    const params = {
      location,
      radius,
      type,
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (keyword) {
      params.keyword = keyword;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        error: 'Nearby search failed',
        message: response.data.status
      });
    }

    const places = response.data.results.map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      rating: place.rating,
      priceLevel: place.price_level,
      photos: place.photos?.map(photo => ({
        photoReference: photo.photo_reference,
        url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      })),
      types: place.types,
      openingHours: place.opening_hours
    }));

    res.json({
      success: true,
      places,
      total: response.data.results.length
    });

  } catch (error) {
    console.error('Error getting nearby places:', error);
    res.status(500).json({
      error: 'Failed to get nearby places',
      message: error.message
    });
  }
});

module.exports = router;


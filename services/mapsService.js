const axios = require('axios');

/**
 * Google Maps service for location data and navigation
 */
class MapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || 'demo-key';
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,rating,photos,reviews,opening_hours,types,price_level',
          key: this.apiKey
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(query, location = null, radius = 5000) {
    try {
      const params = {
        query,
        key: this.apiKey
      };

      if (location) {
        params.location = location;
        params.radius = radius;
      }

      const response = await axios.get(`${this.baseUrl}/place/textsearch/json`, {
        params
      });

      return response.data.results;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Get nearby places
   */
  async getNearbyPlaces(location, type, radius = 1000) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params: {
          location,
          radius,
          type,
          key: this.apiKey
        }
      });

      return response.data.results;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(origin, destination, mode = 'driving') {
    try {
      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin,
          destination,
          mode,
          key: this.apiKey
        }
      });

      return response.data.routes[0];
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  /**
   * Get distance matrix
   */
  async getDistanceMatrix(origins, destinations, mode = 'driving') {
    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: Array.isArray(origins) ? origins.join('|') : origins,
          destinations: Array.isArray(destinations) ? destinations.join('|') : destinations,
          mode,
          key: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      return null;
    }
  }

  /**
   * Get geocoding data
   */
  async geocode(address) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });

      return response.data.results[0];
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Get reverse geocoding data
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      return response.data.results[0];
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get places by type in a city
   */
  async getPlacesByType(city, type) {
    try {
      // First geocode the city
      const geocodeResult = await this.geocode(city);
      if (!geocodeResult) return [];

      const location = geocodeResult.geometry.location;
      return await this.getNearbyPlaces(
        `${location.lat},${location.lng}`,
        type,
        50000 // 50km radius for city-wide search
      );
    } catch (error) {
      console.error('Error getting places by type:', error);
      return [];
    }
  }

  /**
   * Get tourist attractions in a city
   */
  async getTouristAttractions(city) {
    try {
      const attractions = await this.getPlacesByType(city, 'tourist_attraction');
      const museums = await this.getPlacesByType(city, 'museum');
      const parks = await this.getPlacesByType(city, 'park');
      const religiousSites = await this.getPlacesByType(city, 'place_of_worship');

      return {
        attractions: attractions.slice(0, 10),
        museums: museums.slice(0, 5),
        parks: parks.slice(0, 5),
        religiousSites: religiousSites.slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting tourist attractions:', error);
      return { attractions: [], museums: [], parks: [], religiousSites: [] };
    }
  }

  /**
   * Get restaurants in a city
   */
  async getRestaurants(city, cuisine = null) {
    try {
      let restaurants = await this.getPlacesByType(city, 'restaurant');
      
      if (cuisine) {
        restaurants = restaurants.filter(restaurant => 
          restaurant.types.includes(cuisine.toLowerCase())
        );
      }

      return restaurants.slice(0, 20);
    } catch (error) {
      console.error('Error getting restaurants:', error);
      return [];
    }
  }

  /**
   * Get accommodations in a city
   */
  async getAccommodations(city) {
    try {
      const hotels = await this.getPlacesByType(city, 'lodging');
      return hotels.slice(0, 15);
    } catch (error) {
      console.error('Error getting accommodations:', error);
      return [];
    }
  }

  /**
   * Get transportation options
   */
  async getTransportationOptions(origin, destination) {
    try {
      const modes = ['driving', 'transit', 'walking', 'bicycling'];
      const options = {};

      for (const mode of modes) {
        try {
          const directions = await this.getDirections(origin, destination, mode);
          if (directions) {
            options[mode] = {
              duration: directions.legs[0].duration.text,
              distance: directions.legs[0].distance.text,
              steps: directions.legs[0].steps.map(step => ({
                instruction: step.html_instructions,
                duration: step.duration.text,
                distance: step.distance.text
              }))
            };
          }
        } catch (modeError) {
          console.error(`Error getting ${mode} directions:`, modeError);
        }
      }

      return options;
    } catch (error) {
      console.error('Error getting transportation options:', error);
      return {};
    }
  }

  /**
   * Get real-time traffic data
   */
  async getTrafficData(origin, destination) {
    try {
      const directions = await this.getDirections(origin, destination, 'driving');
      if (!directions) return null;

      return {
        duration: directions.legs[0].duration.text,
        durationInTraffic: directions.legs[0].duration_in_traffic?.text || directions.legs[0].duration.text,
        distance: directions.legs[0].distance.text,
        trafficLevel: this.calculateTrafficLevel(directions.legs[0])
      };
    } catch (error) {
      console.error('Error getting traffic data:', error);
      return null;
    }
  }

  /**
   * Calculate traffic level based on duration difference
   */
  calculateTrafficLevel(leg) {
    if (!leg.duration_in_traffic) return 'normal';
    
    const normalDuration = leg.duration.value;
    const trafficDuration = leg.duration_in_traffic.value;
    const difference = ((trafficDuration - normalDuration) / normalDuration) * 100;

    if (difference > 50) return 'heavy';
    if (difference > 20) return 'moderate';
    return 'light';
  }

  /**
   * Get place photos
   */
  async getPlacePhotos(placeId, maxPhotos = 5) {
    try {
      const placeDetails = await this.getPlaceDetails(placeId);
      if (!placeDetails || !placeDetails.photos) return [];

      const photos = placeDetails.photos.slice(0, maxPhotos).map(photo => ({
        photo_reference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        url: `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
      }));

      return photos;
    } catch (error) {
      console.error('Error getting place photos:', error);
      return [];
    }
  }

  /**
   * Get optimized route for multiple destinations
   */
  async getOptimizedRoute(origin, destinations) {
    try {
      // This would require the Google Maps Routes API
      // For now, return a simple route
      const waypoints = destinations.slice(0, -1).join('|');
      const destination = destinations[destinations.length - 1];

      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin,
          destination,
          waypoints: waypoints || undefined,
          optimize: true,
          key: this.apiKey
        }
      });

      return response.data.routes[0];
    } catch (error) {
      console.error('Error getting optimized route:', error);
      return null;
    }
  }

  /**
   * Get elevation data
   */
  async getElevationData(locations) {
    try {
      const locationString = Array.isArray(locations) 
        ? locations.map(loc => `${loc.lat},${loc.lng}`).join('|')
        : `${locations.lat},${locations.lng}`;

      const response = await axios.get(`${this.baseUrl}/elevation/json`, {
        params: {
          locations: locationString,
          key: this.apiKey
        }
      });

      return response.data.results;
    } catch (error) {
      console.error('Error getting elevation data:', error);
      return [];
    }
  }

  /**
   * Get timezone data
   */
  async getTimezoneData(location, timestamp = null) {
    try {
      const params = {
        location: `${location.lat},${location.lng}`,
        key: this.apiKey
      };

      if (timestamp) {
        params.timestamp = timestamp;
      }

      const response = await axios.get(`${this.baseUrl}/timezone/json`, {
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error getting timezone data:', error);
      return null;
    }
  }
}

module.exports = new MapsService();

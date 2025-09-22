import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Generate personalized itinerary
 */
export const generateItinerary = async (tripData) => {
  try {
    const response = await api.post('/ai/generate-itinerary', tripData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate itinerary');
  }
};

/**
 * Get personalized recommendations
 */
export const getRecommendations = async (recommendationData) => {
  try {
    const response = await api.post('/ai/recommendations', recommendationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get recommendations');
  }
};

/**
 * Adjust existing itinerary
 */
export const adjustItinerary = async (adjustmentData) => {
  try {
    const response = await api.post('/ai/adjust-itinerary', adjustmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to adjust itinerary');
  }
};

/**
 * Get user's trip history
 */
export const getTripHistory = async () => {
  try {
    const response = await api.get('/trips/history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get trip history');
  }
};

/**
 * Save itinerary
 */
export const saveItinerary = async (itineraryData) => {
  try {
    const response = await api.post('/trips/save', itineraryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to save itinerary');
  }
};

/**
 * Get itinerary by ID
 */
export const getItinerary = async (itineraryId) => {
  try {
    const response = await api.get(`/trips/${itineraryId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get itinerary');
  }
};

/**
 * Update itinerary
 */
export const updateItinerary = async (itineraryId, updateData) => {
  try {
    const response = await api.put(`/trips/${itineraryId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update itinerary');
  }
};

/**
 * Delete itinerary
 */
export const deleteItinerary = async (itineraryId) => {
  try {
    const response = await api.delete(`/trips/${itineraryId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete itinerary');
  }
};

/**
 * Share itinerary
 */
export const shareItinerary = async (itineraryId, shareData) => {
  try {
    const response = await api.post(`/trips/${itineraryId}/share`, shareData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to share itinerary');
  }
};

/**
 * Get popular destinations
 */
export const getPopularDestinations = async () => {
  try {
    const response = await api.get('/trips/popular-destinations');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get popular destinations');
  }
};

/**
 * Get destination information
 */
export const getDestinationInfo = async (destination) => {
  try {
    const response = await api.get(`/maps/destination/${encodeURIComponent(destination)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get destination information');
  }
};

/**
 * Get weather information
 */
export const getWeatherInfo = async (destination, date) => {
  try {
    const response = await api.get(`/maps/weather`, {
      params: { destination, date }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get weather information');
  }
};

/**
 * Search places
 */
export const searchPlaces = async (query, location) => {
  try {
    const response = await api.get('/maps/search', {
      params: { query, location }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search places');
  }
};

/**
 * Get place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await api.get(`/maps/place/${placeId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get place details');
  }
};

/**
 * Calculate route
 */
export const calculateRoute = async (origin, destination, mode = 'driving') => {
  try {
    const response = await api.post('/maps/route', {
      origin,
      destination,
      mode
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to calculate route');
  }
};

/**
 * Get nearby places
 */
export const getNearbyPlaces = async (location, type, radius = 5000) => {
  try {
    const response = await api.get('/maps/nearby', {
      params: { location, type, radius }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get nearby places');
  }
};

export default api;

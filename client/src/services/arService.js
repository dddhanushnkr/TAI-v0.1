import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

/**
 * Generate AR content for a landmark
 */
export const generateARContent = async (landmark, destination) => {
  try {
    const response = await api.post('/ar/content', { landmark, destination });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate AR content');
  }
};

/**
 * Generate AR experiences for itinerary
 */
export const generateARExperiences = async (itinerary, userInterests) => {
  try {
    const response = await api.post('/ar/experiences', { itinerary, userInterests });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate AR experiences');
  }
};

export default api;

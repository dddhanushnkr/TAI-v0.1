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
 * Calculate carbon footprint
 */
export const calculateCarbonFootprint = async (itinerary) => {
  try {
    const response = await api.post('/sustainability/carbon-footprint', { itinerary });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to calculate carbon footprint');
  }
};

/**
 * Calculate local impact
 */
export const calculateLocalImpact = async (itinerary) => {
  try {
    const response = await api.post('/sustainability/local-impact', { itinerary });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to calculate local impact');
  }
};

/**
 * Generate sustainability report
 */
export const generateSustainabilityReport = async (itinerary) => {
  try {
    const response = await api.post('/sustainability/report', { itinerary });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate sustainability report');
  }
};

/**
 * Get eco-friendly alternatives
 */
export const getEcoFriendlyAlternatives = async (itinerary) => {
  try {
    const response = await api.post('/sustainability/alternatives', { itinerary });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get eco-friendly alternatives');
  }
};

export default api;

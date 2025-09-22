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
 * Process voice command
 */
export const processVoiceCommand = async (commandData) => {
  try {
    const response = await api.post('/voice/process', commandData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to process voice command');
  }
};

/**
 * Get available voice commands
 */
export const getVoiceCommands = async () => {
  try {
    const response = await api.get('/voice/commands');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get voice commands');
  }
};

export default api;

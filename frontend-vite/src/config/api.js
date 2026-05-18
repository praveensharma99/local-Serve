// API Configuration:
// - Desktop localhost: uses http://localhost:5000
// - LAN access: uses current browser hostname with port 5000
//export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://local-serve-de95.onrender.com';

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

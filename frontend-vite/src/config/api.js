// API Configuration:
// - Desktop localhost: uses http://localhost:5000
// - LAN access: uses current browser hostname with port 5000
const currentHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
const apiHost =
  currentHost === "localhost" || currentHost === "127.0.0.1"
    ? "localhost"
    : currentHost;

export const API_BASE_URL = `http://${apiHost}:5000`;

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

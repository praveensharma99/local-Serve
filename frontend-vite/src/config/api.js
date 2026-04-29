// API Configuration
// Change this URL based on your testing environment:
// - Desktop: 'http://localhost:5000'
// - Mobile (same WiFi): 'http://192.168.11.203:5000' (use your computer's IP)
// - Production: 'https://your-domain.com'

// ⚠️ FOR MOBILE TESTING - Change to your IP address
export const API_BASE_URL = 'http://192.168.11.203:5000';

// FOR DESKTOP TESTING - Uncomment this line and comment the line above
// export const API_BASE_URL = 'http://localhost:5000';

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

// API endpoints
const API_BASE_URL = 'http://localhost:3000/api';

// Auth endpoints
const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: '/auth/google',
  LOCAL_LOGIN: '/auth/login',
  LOCAL_REGISTER: '/auth/register',
  LOGOUT: '/auth/logout'
};

// Expense endpoints
const EXPENSE_ENDPOINTS = {
  GET_ALL: '/expenses',
  CREATE: '/expenses',
  UPDATE: (id) => `/expenses/${id}`,
  DELETE: (id) => `/expenses/${id}`
};

// Helper function to check if user is authenticated
function isAuthenticated() {
  return fetch(`${API_BASE_URL}/expenses`)
    .then(response => response.ok)
    .catch(() => false);
}

// Helper function to get current user
function getCurrentUser() {
  return fetch(`${API_BASE_URL}/expenses`)
    .then(response => {
      if (response.ok) {
        return response.json().then(expenses => {
          if (expenses.length > 0) {
            return {
              id: expenses[0].user_id,
              // Other user details will be available from the server session
            };
          }
          return null;
        });
      }
      return null;
    })
    .catch(() => null);
}

// Export configuration
window.ExpenseeaseConfig = {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  EXPENSE_ENDPOINTS,
  isAuthenticated,
  getCurrentUser
}; 
import instance from './axios';

const TOKEN_KEY = 'auth_token';

/**
 * Get stored authentication token
 * @returns {string|null} The stored token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set authentication token in storage
 * @param {string} token - The token to store
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove authentication token from storage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get authorization headers with token
 * @returns {object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Token ${token}` } : {};
};

/**
 * Register a new user
 * POST /api/auth/register/
 * isSecure: false
 * @param {string} username - Unique username for the account
 * @param {string} password - Password for the account (min 8 characters)
 * @returns {Promise<{id: number, username: string, message: string}>}
 */
export const register = async (username, password) => {
  const response = await instance.post('/api/auth/register/', {
    username,
    password,
  });
  return response.data;
};

/**
 * Login user and get authentication token
 * POST /api/auth/login/
 * isSecure: false
 * @param {string} username - Username of the account
 * @param {string} password - Password of the account
 * @returns {Promise<{token: string, user: {id: number, username: string}}>}
 */
export const login = async (username, password) => {
  const response = await instance.post('/api/auth/login/', {
    username,
    password,
  });
  
  if (response.data.token) {
    setToken(response.data.token);
  }
  
  return response.data;
};

/**
 * Logout user and invalidate token
 * POST /api/auth/logout/
 * isSecure: true
 * @returns {Promise<{detail: string}>}
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout/', {}, {
    headers: getAuthHeaders(),
  });
  
  removeToken();
  
  return response.data;
};

/**
 * Get current user profile
 * GET /api/profile/
 * isSecure: true
 * @returns {Promise<{id: number, username: string, email: string, first_name: string, last_name: string, date_joined: string}>}
 */
export const getProfile = async () => {
  const response = await instance.get('/api/profile/', {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Update current user profile
 * PUT /api/profile/
 * isSecure: true
 * @param {object} data - Profile data to update
 * @param {string} [data.email] - Email address
 * @param {string} [data.first_name] - First name
 * @param {string} [data.last_name] - Last name
 * @returns {Promise<{id: number, username: string, email: string, first_name: string, last_name: string, date_joined: string}>}
 */
export const updateProfile = async (data) => {
  const response = await instance.put('/api/profile/', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getToken,
  setToken,
  removeToken,
  getAuthHeaders,
};

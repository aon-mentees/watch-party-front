import apiClient from '../config/api';

const authService = {
  signUp: async ({ phoneNumber, email, password, fullName }) => {
    try {
      const response = await apiClient.post('/api/v1/auth/signup', {
        phoneNumber,
        email,
        password,
        fullName,
      });

      const { data } = response;

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Sign up failed');
    }
  },

  signIn: async ({ email, password }) => {
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { data } = response;

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  logout: async () => {
    try {

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  refreshToken: async () => {
    try {
      const response = await apiClient.post('/api/v1/auth/refresh');
      const { data } = response;

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Token refresh failed');
    }
  },
};

export default authService;
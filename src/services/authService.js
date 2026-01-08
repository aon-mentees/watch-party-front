import apiClient from '../config/api';

const authService = {
  signUp: async ({ phoneNumber, email, password, fullName }) => {
    try {
      console.log("Attempting signup with:", { phoneNumber, email, fullName });
      const response = await apiClient.post('/api/v1/auth/signup', {
        phoneNumber,
        email,
        password,
        fullName,
      });

      console.log("Full response:", response);
      
      const responseData = response.data.data;
      console.log("Response data:", responseData);

      const token = responseData.token;
      
      const user = {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        phoneNumber: responseData.phoneNumber,
      };

      // if (!token) {
      //   console.error("Missing token in response:", responseData);
      //   throw new Error('Invalid response: missing token');
      // }

      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      console.log("Signup success - data saved to localStorage");
      // console.log("Token:", token.substring(0, 50) + "...");
      // console.log("User:", user);

      return { token, user };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  signIn: async ({ email, password }) => {
    try {
      console.log("Attempting signin with:", { email });
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      console.log("Full response:", response);
      
      const responseData = response.data.data;
      console.log("Response data:", responseData);

      const token = responseData.token;
      
      const user = {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        phoneNumber: responseData.phoneNumber,
      };

      if (!token) {
        console.error("Missing token in response:", responseData);
        throw new Error('Invalid response: missing token');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      console.log("SignIn success - data saved to localStorage");
      console.log("Token:", token.substring(0, 50) + "...");
      console.log("User:", user);

      return { token, user };
    } catch (error) {
      console.error("Signin error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
      throw error;
    }
  },
};

export default authService;
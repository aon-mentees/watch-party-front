import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
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

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      const backendError = Array.isArray(data?.errors) ? data.errors[0] : null;
      const backendMessage = backendError?.message || data?.message || data?.error;
      const errorCode = backendError?.code || status;

      let errorMessage = backendMessage || 'An error occurred. Please try again.';

      switch (status) {
        case 400:
          errorMessage = errorMessage || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = errorMessage || 'Authentication required. Please login again.';
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
          break;
        case 403:
          errorMessage = errorMessage || 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = errorMessage || 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = errorMessage || 'A conflict occurred. The resource may already exist.';
          break;
        case 422:
          errorMessage = errorMessage || 'Validation failed. Please check your input.';
          break;
        case 500:
          errorMessage = errorMessage || 'Server error. Please try again later.';
          break;
        case 502:
          errorMessage = errorMessage || 'Bad gateway. The server is temporarily unavailable.';
          break;
        case 503:
          errorMessage = errorMessage || 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = errorMessage || 'An error occurred. Please try again.';
      }

      console.error(`API Error (${status}):`, errorMessage);

      return Promise.reject({
        message: errorMessage,
        code: errorCode,
        status,
        data,
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error: Please check your internet connection',
        code: 0,
        status: 0,
      });
    } else {
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        code: 0,
        status: 0,
      });
    }
  }
);

export default apiClient;

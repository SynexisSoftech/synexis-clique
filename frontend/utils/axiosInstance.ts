// src/utils/axiosInstance.ts (or lib/axiosInstance.ts)
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('NEXT_PUBLIC_API_BASE_URL is not defined in .env.local');
  // You might want to throw an error or handle this more gracefully in a real app
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  withCredentials: true, // IMPORTANT: Allows cookies to be sent and received
  headers: {
    'Content-Type': 'application/json',
    // You can add other default headers here, e.g., Authorization later
  },
});

// Optional: Add request and response interceptors for global error handling, logging, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
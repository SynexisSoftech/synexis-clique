// // lib/apiClient.ts
// import axios from 'axios';

// // 1. Create the Axios instance with a base URL.
// //    Use an environment variable for your API's URL.
// const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // 2. Use an interceptor to automatically add the auth token to every request.
// //    This is the magic part. It runs before each request is sent.
// apiClient.interceptors.request.use(
//   (config) => {
//     // Retrieve the token from localStorage (we'll set this up in the Auth Context).
//     const token = localStorage.getItem('token');
//     if (token) {
//       // If the token exists, add it to the Authorization header.
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     // Handle request errors here.
//     return Promise.reject(error);
//   }
// );

// // Optional: Interceptor to handle token refresh on 401 errors
// // This is a more advanced pattern for seamless user experience.
// apiClient.interceptors.response.use(
//   (response) => response, // If response is successful, just return it
//   async (error) => {
//     const originalRequest = error.config;

//     // Check if the error is a 401 Unauthorized and we haven't already retried
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true; // Mark that we've retried this request

//       try {
//         // Call your refresh token endpoint
//         const { data } = await axios.post(
//           `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
//           {},
//           { withCredentials: true } // Important if you use HttpOnly cookies for refresh tokens
//         );

//         const newAccessToken = data.accessToken;
//         localStorage.setItem('token', newAccessToken); // Store the new token
//         apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
//         // Retry the original request with the new token
//         return apiClient(originalRequest);

//       } catch (refreshError) {
//         // If refresh fails, log the user out
//         console.error("Token refresh failed:", refreshError);
//         // Here you would trigger a logout action (e.g., redirect to /login)
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/auth/login'; // Force redirect
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );


// export default apiClient;



// lib/apiClient.ts// utils/axiosInstance.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Keep this, it's correct
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // It's often good to set this at the instance level if most requests need it
});

// Function to update the token in the instance
export const updateApiToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const clearApiToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and not a retry attempt
    if (error.response?.status === 401 && !originalRequest._retry) { // Use optional chaining for safety
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      try {
        // --- FIX HERE: Use apiClient for the refresh token request ---
        const { data } = await apiClient.post(
          '/api/auth/refresh-token', // Just the relative path, baseURL handles the rest
          {},
          { withCredentials: true } // Ensure withCredentials is set, even if on instance, for clarity
        );

        const newAccessToken = data.accessToken;
        updateApiToken(newAccessToken); // Update the in-memory token for future requests

        // Update the original failed request's Authorization header and re-send it
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest); // Resend the original request with the new token
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        clearApiToken(); // Clear token on refresh failure
        localStorage.removeItem('user'); // Clear user data
        if (typeof window !== 'undefined') {
          // Dispatch a custom event for the AuthContext to listen to and trigger full logout
          window.dispatchEvent(new Event('auth-failure'));
        }
        return Promise.reject(refreshError); // Reject the promise with the refresh error
      }
    }

    // For any other error (not 401 or already retried), just reject
    return Promise.reject(error);
  }
);

export default apiClient;
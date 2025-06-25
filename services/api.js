import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL for API requests
// const API_URL = "http://192.168.34.181:5000/api"; // For Android emulator
// const API_URL = 'http://localhost:5000/api'; // For iOS simulator
const API_URL = "https://quisipp-delivery-backend-1.onrender.com/api"; // For iOS simulator
// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log the request details
      console.log(
        `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
          config.url
        }`,
        config.data ? JSON.stringify(config.data) : ""
      );
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(
      `API Response [${
        response.status
      }]: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data ? JSON.stringify(response.data) : ""
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error responses with detailed information
    console.error("API Error Response:", {
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message,
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // You could implement token refresh logic here if needed
      // For now, we'll just clear the token and let the user re-login
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      // You could navigate to login screen here if you had access to navigation
    }

    return Promise.reject(error);
  }
);

export default api;

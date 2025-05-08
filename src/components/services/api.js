// Modified api.js with fixed ID handling and API parameters

// File: components/services/api.js
// This file contains the API service for the frontend
import axios from "axios";

// Define the API base URL
const API_URL = "http://localhost:8080";

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending/receiving cookies with requests
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage - this is a backup in case cookies don't work
    const token = localStorage.getItem("authToken");

    // If token exists, add it to Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) errors
    if (error.response && error.response.status === 401) {
      console.log("Authentication error detected, redirecting to login");

      // Clear auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("profileData");

      // Get the current path to use as redirect parameter
      const currentPath = window.location.pathname.replace("/", "");
      const redirectParam = currentPath ? `?redirect=${currentPath}` : "";

      // Redirect to login page if not already there
      if (window.location.pathname !== "/profile") {
        window.location.href = `/profile${redirectParam}`;
      }
    }

    return Promise.reject(error);
  }
);

// Helper function - ensures IDs are always numeric when sent to the API
const ensureNumericId = (id) => {
  if (id === undefined || id === null) return null;

  // If id is a string that contains only digits, convert to number
  if (typeof id === "string" && /^\d+$/.test(id)) {
    return parseInt(id, 10);
  }

  // If already numeric, return as is
  if (typeof id === "number") {
    return id;
  }

  // For other cases, return the ID as is but log a warning
  console.warn(
    `Warning: Non-numeric ID passed: ${id}. Server may reject this.`
  );
  return id;
};

// Service object with API functions
const apiService = {
  // Auth services
  auth: {
    register: (formData) =>
      axios.post(`${API_URL}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }),
    login: (credentials) => api.post("/login", credentials),
    getCurrentUser: (userId) => {
      const numericId = ensureNumericId(userId);
      return api.get(`/users/${numericId}`);
    },
    updateProfile: (userId, userData) => {
      const numericId = ensureNumericId(userId);
      return api.put(`/users/${numericId}`, userData);
    },
    logout: () => {
      // Clear local storage and cookies
      localStorage.removeItem("authToken");
      localStorage.removeItem("profileData");
      localStorage.removeItem("selectedPlan");

      // Clear JWT cookie
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      return Promise.resolve({ status: "success" });
    },
  },

  // Content services
  content: {
    getAllContent: () => api.get("/contents"),
    getContentById: (contentId) => {
      const numericId = ensureNumericId(contentId);
      return api.get(`/content/${numericId}`);
    },
    searchContent: (query) => api.get(`/contents?search=${query}`),
    getContentByCategory: (category) =>
      api.get(`/contents?category=${category}`),
  },

  // Favorites services
  favorites: {
    addFavorite: (userId, contentId) => {
      return api.post("/favorites", {
        user_id: ensureNumericId(userId),
        content_id: ensureNumericId(contentId),
      });
    },
    getUserFavorites: (userId) => {
      const numericId = ensureNumericId(userId);
      return api.get(`/favorites/${numericId}`);
    },
    removeFavorite: (userId, contentId) => {
      const numericId = ensureNumericId(userId);
      return api.delete(`/favorites/${numericId}`, {
        data: { content_id: ensureNumericId(contentId) },
      });
    },
    checkFavorite: (userId, contentId) => {
      const numericUserId = ensureNumericId(userId);
      const numericContentId = ensureNumericId(contentId);
      return api.get(`/favorites/${numericUserId}/check/${numericContentId}`);
    },
  },

  // Review services
  reviews: {
    addReview: (reviewData) => {
      // Ensure user_id and content_id are numeric
      const parsedData = {
        ...reviewData,
        user_id: ensureNumericId(reviewData.user_id),
        content_id: ensureNumericId(reviewData.content_id),
      };
      return api.post("/reviews", parsedData);
    },
    getContentReviews: (contentId) => {
      const numericId = ensureNumericId(contentId);
      return api.get(`/reviews/${numericId}`);
    },
    updateReview: (reviewId, reviewData) => {
      const numericId = ensureNumericId(reviewId);
      return api.put(`/reviews/${numericId}`, reviewData);
    },
    deleteReview: (reviewId) => {
      const numericId = ensureNumericId(reviewId);
      return api.delete(`/reviews/${numericId}`);
    },
  },

  // Watch history services
  history: {
    recordWatch: (userId, contentId, data = {}) => {
      return api.post("/watch_history", {
        user_id: ensureNumericId(userId),
        content_id: ensureNumericId(contentId),
        progress: data.progress || new Date().toISOString(),
        language_preference: data.language || "English",
        cc_preference: data.cc || "Off",
      });
    },
    getUserHistory: (userId) => {
      const numericId = ensureNumericId(userId);
      return api.get(`/watch_history/${numericId}`);
    },
    clearHistory: (userId) => {
      const numericId = ensureNumericId(userId);
      return api.delete(`/watch_history/${numericId}`);
    },
  },
};

// Helper function to handle API errors consistently
export const handleApiError = (error, defaultMessage = "An error occurred") => {
  // Check if it's an axios error with a response
  if (error.response && error.response.data) {
    // If the API returns an error message, use it
    if (typeof error.response.data === "string") {
      return error.response.data;
    }

    // If the API returns an error object with a message
    if (error.response.data.error || error.response.data.message) {
      return error.response.data.error || error.response.data.message;
    }
  }

  // If there's a network error
  if (error.message === "Network Error") {
    return "Cannot connect to server. Please check your internet connection.";
  }

  // For any other errors, return the default message
  return defaultMessage;
};

export default apiService;
export { api }; // Also export the raw api for direct use if needed

// services/api.js
import axios from "axios";

const API_URL = "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login"; // Adjust based on your routing
    }
    return Promise.reject(error);
  }
);
// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Check if we're trying to access a protected route
      const protectedRoutes = ["/me", "/movie/", "/watchlist"];
      const isProtectedRoute = protectedRoutes.some((route) =>
        error.config.url.includes(route)
      );

      if (isProtectedRoute) {
        // Clear localStorage and redirect to login
        localStorage.removeItem("authToken");
        window.location.href = "/login"; // Adjust based on your routing
      }
    }
    return Promise.reject(error);
  }
);
// Auth services
export const authService = {
  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
  logout: () => {
    localStorage.removeItem("authToken");
  },
  getCurrentUser: () => {
    const token = localStorage.getItem("authToken");
    return token ? api.get("/me") : Promise.reject("No auth token");
  },
};

export default api;

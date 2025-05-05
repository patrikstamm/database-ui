// components/context/authContext.jsx - Fixed
import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

// Create the auth context
const AuthContext = createContext();

// Helper to ensure numeric IDs
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

  return id;
};

// Create a provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for authentication on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem("authToken");
    const profileData = localStorage.getItem("profileData");

    if (token && profileData) {
      try {
        const userData = JSON.parse(profileData);

        // Ensure user ID is always numeric if it's a string of digits
        if (userData.id) {
          userData.id = ensureNumericId(userData.id);
        }

        setUser(userData);
        setIsAuthenticated(true);
        console.log("User authenticated from localStorage:", userData);

        // Optionally verify with the backend
        if (userData.id) {
          try {
            const response = await apiService.auth.getCurrentUser(userData.id);
            // Update user data if backend has newer info
            if (response.data) {
              const updatedUser = {
                ...userData,
                id:
                  ensureNumericId(response.data.user_id) ||
                  ensureNumericId(response.data.UserID) ||
                  userData.id,
                name: response.data.username || userData.name,
                email: response.data.email || userData.email,
                subscription:
                  response.data.subscription || userData.subscription,
              };

              // Only update if there are changes
              if (JSON.stringify(updatedUser) !== JSON.stringify(userData)) {
                console.log("Updating user data from API:", updatedUser);
                setUser(updatedUser);
                localStorage.setItem(
                  "profileData",
                  JSON.stringify(updatedUser)
                );
              }
            }
          } catch (apiError) {
            console.warn("Could not verify authentication with API:", apiError);
            // We still keep the user logged in using localStorage data
          }
        }
      } catch (e) {
        console.error("Error parsing profile data", e);
        // Clear invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("profileData");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false);
  };

  // Login function
  const login = async (userData) => {
    console.log("Logging in user:", userData);

    // Ensure user ID is numeric if possible
    if (userData.id) {
      userData.id = ensureNumericId(userData.id);
    }

    // Set authentication state
    setUser(userData);
    setIsAuthenticated(true);

    // Store user data
    localStorage.setItem("profileData", JSON.stringify(userData));

    // You could also refresh the user's data from the backend here
    if (userData.id) {
      try {
        await checkAuth(); // Re-check auth to get the latest user data
      } catch (error) {
        console.error("Error refreshing user data after login:", error);
      }
    }
  };

  // Logout function
  const logout = async () => {
    console.log("Logging out user");

    // Clear local data
    localStorage.removeItem("authToken");
    localStorage.removeItem("profileData");
    localStorage.removeItem("selectedPlan");

    // Clear authentication state
    setIsAuthenticated(false);
    setUser(null);

    // Attempt to clear the backend session too (optional)
    try {
      // Clear cookies
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
      console.error("Error during logout:", error);
      // Still consider the user logged out locally
    }
  };

  // Update user function
  const updateUser = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };

      // Ensure ID is numeric if possible
      if (updatedUser.id) {
        updatedUser.id = ensureNumericId(updatedUser.id);
      }

      setUser(updatedUser);
      localStorage.setItem("profileData", JSON.stringify(updatedUser));
    }
  };

  // Provide these values to components
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

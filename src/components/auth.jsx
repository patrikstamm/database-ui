// components/Auth.jsx - Fixed with proper numeric ID handling
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./card";
import { Input } from "./input";
import { Button } from "./button";
import apiService from "./services/api";
import { useLocation } from "react-router-dom";

export default function Auth({ onAuthenticated }) {
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const redirectTo = urlParams.get("redirect");

  // Store the redirect in localStorage if it exists
  useEffect(() => {
    if (redirectTo) {
      localStorage.setItem("redirectAfterLogin", redirectTo);
    }
  }, [redirectTo]);

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const [registerInfo, setRegisterInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    subscription: "Free", // Default subscription
    age: 18, // Default age
  });

  const handleLoginChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Make the API call using the service
      const response = await apiService.auth.login(loginInfo);

      console.log("Login success:", response.data);

      // Get token from cookie or create a simulated one if not provided
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("jwt="))
          ?.split("=")[1] || "simulated-token-" + Date.now();

      // Fetch user data after login
      let userData;
      try {
        // Try to get user data from the API
        const userResponse = await apiService.auth.getCurrentUser();
        const userId = userResponse.data.user_id || userResponse.data.UserID;

        // Ensure ID is numeric - this is critical
        userData = {
          id: typeof userId === "string" ? parseInt(userId, 10) : userId,
          name: userResponse.data.username || userResponse.data.UserName,
          email: userResponse.data.email || userResponse.data.Email,
          subscription: userResponse.data.subscription || "Free",
        };
      } catch (error) {
        // Fallback to basic user info if API call fails
        console.error("Error fetching user data:", error);

        // Create a numeric user ID for demo purposes
        userData = {
          id: 1, // Using a numeric ID instead of "user1"
          name: loginInfo.email.split("@")[0],
          email: loginInfo.email,
          subscription: "Free",
        };
      }

      // Store token in localStorage
      localStorage.setItem("authToken", token);

      // Store user data in localStorage
      localStorage.setItem("profileData", JSON.stringify(userData));

      // Call the onAuthenticated callback with the user data
      if (onAuthenticated) {
        onAuthenticated(userData);
      }

      // Check for redirect in localStorage
      const savedRedirect = localStorage.getItem("redirectAfterLogin");

      // Clear the redirect info
      localStorage.removeItem("redirectAfterLogin");

      // Navigate based on saved redirect or default to movies
      if (savedRedirect) {
        window.location.href = `/${savedRedirect}`;
      } else {
        // Default redirect to movies page
        window.location.href = "/movies";
      }
    } catch (error) {
      console.error("Login error:", error);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterInfo({ ...registerInfo, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerInfo.password !== registerInfo.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // Prepare data for registration - omit confirmPassword
      const registerData = {
        username: registerInfo.username,
        email: registerInfo.email,
        password: registerInfo.password,
        subscription: "Free",
        age: 18,
      };

      // Make the API call using the service
      const response = await apiService.auth.register(registerData);

      console.log("Registration success:", response.data);

      // Login after successful registration
      try {
        await apiService.auth.login({
          email: registerInfo.email,
          password: registerInfo.password,
        });
      } catch (loginError) {
        console.error("Auto-login after registration failed:", loginError);
        // Continue with registration flow even if login fails
      }

      // Get token from cookie or create a simulated one
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("jwt="))
          ?.split("=")[1] || "simulated-token-" + Date.now();

      // Create a user object with numeric ID
      const userData = {
        id: 1, // Using a numeric ID instead of "user1"
        name: registerInfo.username,
        email: registerInfo.email,
        subscription: "Free",
      };

      // Store token in localStorage
      localStorage.setItem("authToken", token);

      // Store user data in localStorage
      localStorage.setItem("profileData", JSON.stringify(userData));

      // Call the onAuthenticated callback with the user data
      if (onAuthenticated) {
        onAuthenticated(userData);
      }

      // Check for redirect in localStorage
      const savedRedirect = localStorage.getItem("redirectAfterLogin");

      // Clear the redirect info
      localStorage.removeItem("redirectAfterLogin");

      // Navigate based on saved redirect or default to movies
      if (savedRedirect) {
        window.location.href = `/${savedRedirect}`;
      } else {
        // Default redirect to movies page
        window.location.href = "/movies";
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-gray-900 border-none shadow-xl">
      <CardContent className="p-8">
        <h1 className="text-3xl font-semibold text-white mb-8">
          {authMode === "login" ? "Login" : "Register"}
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {authMode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  required
                  value={loginInfo.email}
                  onChange={handleLoginChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  required
                  value={loginInfo.password}
                  onChange={handleLoginChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-center text-gray-400 mt-6">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  name="username"
                  required
                  value={registerInfo.username}
                  onChange={handleRegisterChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  required
                  value={registerInfo.email}
                  onChange={handleRegisterChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  name="password"
                  type="password"
                  required
                  value={registerInfo.password}
                  onChange={handleRegisterChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  required
                  value={registerInfo.confirmPassword}
                  onChange={handleRegisterChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4"
              >
                {loading ? "Registering..." : "Register"}
              </Button>

              <p className="text-center text-gray-400 mt-6">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// components/Auth.jsx
import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./card";
import { Input } from "./input";
import { Button } from "./button";

export default function Auth({ onAuthenticated }) {
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/login",
        loginInfo
      );

      console.log("Login success:", response.data);

      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);

        // Set authorization header for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      onAuthenticated(response.data.user); // Pass user data to parent component
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
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
      const response = await axios.post("http://localhost:8080/register", {
        name: registerInfo.name,
        email: registerInfo.email,
        password: registerInfo.password,
      });

      console.log("Registration success:", response.data);

      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);

        // Set authorization header for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }

      onAuthenticated(response.data.user); // Pass user data to parent component
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
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
                  Name
                </label>
                <Input
                  name="name"
                  required
                  value={registerInfo.name}
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

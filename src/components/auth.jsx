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
    profilePicture: "", // ✅ เพิ่มบรรทัดนี้
  });

  const handleLoginChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // ล้างข้อความ error ก่อนทุกครั้ง

    try {
      const loginResponse = await apiService.auth.login(loginInfo);
      if (!loginResponse || !loginResponse.data) {
        throw new Error("Login API response invalid");
      }

      // ✔ ดึง token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1] || `simulated-token-${Date.now()}`;

      // ✔ เรียก /users/:user_id เพื่อดึง user + รูป
      const userId = loginResponse.data.user.userID;
      const userResponse = await apiService.auth.getCurrentUser(userId);
      const user = userResponse.data?.user;

      if (!user || !user.userID) {
        throw new Error("Failed to fetch user data");
      }

      const userData = {
        id: user.userID || user.user_id || user.id,
        name: user.username,
        email: user.email,
        subscription: user.subscription,
        profilePicture: user.profilePicture || "",
      };

      // ✅ บันทึก token และ user ลง localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("profileData", JSON.stringify(userData));

      // ✅ ส่ง callback กลับไปยัง Profile
      if (onAuthenticated) onAuthenticated(userData);

      // ✅ Redirect
      const savedRedirect = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = savedRedirect ? `/${savedRedirect}` : "/movies";
    } catch (err) {
      console.error("🔥 Login Error:", err);
      setError(err.message || "Login failed. Please try again.");
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
        subscription: registerInfo.subscription,
        age: registerInfo.age,
        profilePicture: registerInfo.profilePicture, // เพิ่มการส่ง profile picture
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
        id: 1, // เปลี่ยนเป็น ID ที่ถูกต้องจาก backend
        name: registerInfo.username,
        email: registerInfo.email,
        subscription: registerInfo.subscription,
        profilePicture: registerInfo.profilePicture || "", // เพิ่มตรงนี้
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
              
              <div>
  <label className="block text-gray-300 text-sm font-medium mb-2">
    Profile Picture
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRegisterInfo((prev) => ({
            ...prev,
            profilePicture: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    }}
    className="text-white"
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

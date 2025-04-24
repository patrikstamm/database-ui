// components/Auth.jsx
import React, { useState } from "react";
import { Card, CardContent } from "./card";
import { Input } from "./input";
import { Button } from "./button";

export default function Auth({ onAuthenticated }) {
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  
  // Login form state
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerInfo, setRegisterInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Login form handlers
  const handleLoginChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, this would validate credentials with a backend
    console.log("Logging in with:", loginInfo);
    
    // Simulate a successful login
    onAuthenticated({
      name: "John Doe", // In a real app, this would come from your auth response
      email: loginInfo.email,
    });
  };

  // Register form handlers
  const handleRegisterChange = (e) => {
    setRegisterInfo({ ...registerInfo, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (registerInfo.password !== registerInfo.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    // In a real app, this would send registration data to a backend
    console.log("Registering with:", registerInfo);
    
    // Simulate a successful registration and login
    onAuthenticated({
      name: registerInfo.name,
      email: registerInfo.email,
    });
  };

  return (
    <Card className="w-full max-w-md bg-gray-900 border-none shadow-xl">
      <CardContent className="p-8">
        <h1 className="text-3xl font-semibold text-white mb-8">
          {authMode === "login" ? "Login" : "Register"}
        </h1>
        
        {authMode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
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
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4"
              >
                Login
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
                <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                <Input
                  name="name"
                  required
                  value={registerInfo.name}
                  onChange={handleRegisterChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
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
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
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
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4"
              >
                Register
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
// pages/Profile.jsx
import React, { useState } from "react";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import Auth from "../components/auth";

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [userInfo, setUserInfo] = useState({
    name: " ",
    email: " ",
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAuthenticated = (userData) => {
    setIsAuthenticated(true);
    setUserInfo(userData);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
    
    // Clear error for this field if it exists and now has a value
    if (errors[name] && value.trim()) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!userInfo.name || userInfo.name.trim() === "") {
      newErrors.name = "Name is required";
    }
    
    // Validate email
    if (!userInfo.email || userInfo.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // In a real app you'd update the backend here
      console.log("Saving profile:", userInfo);
      setEditMode(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo({ name: "", email: "" });
    setErrors({});
  };

  return (
    <div className="flex justify-center items-center mt-12">
      {isAuthenticated ? (
        <Card className="w-full max-w-md bg-gray-900 border-none shadow-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-semibold text-white">Your Profile</h1>
              <Button 
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Logout
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Name {editMode && <span className="text-red-500">*</span>}
                </label>
                <Input
                  name="name"
                  value={userInfo.name}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  required={editMode}
                  minLength={1}
                  className={`w-full bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} text-white py-3 px-4 rounded-lg focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}`}
                />
                {errors.name && editMode && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email {editMode && <span className="text-red-500">*</span>}
                </label>
                <Input
                  name="email"
                  type="email"
                  value={userInfo.email}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                  required={editMode}
                  className={`w-full bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white py-3 px-4 rounded-lg focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}`}
                />
                {errors.email && editMode && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              {editMode ? (
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4" 
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              ) : (
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors mt-4" 
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Auth onAuthenticated={handleAuthenticated} />
      )}
    </div>
  );
}

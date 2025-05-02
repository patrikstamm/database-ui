// pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import Auth from "../components/auth";
import { tiers } from "../components/tierData.js"; //make the code read easier by importing tiers from other

const defaultAvatar = "/api/placeholder/200/200"; //have to fetch from the backend

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [userInfo, setUserInfo] = useState({
    name: "Your Name", // Default value instead of empty space
    email: "your.email@example.com", // Default value instead of empty space
    subscription: "Free", // Default subscription
    profilePicture: defaultAvatar, // Default profile picture
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // For resetting file input

  // Add password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Find the current subscription details
  const currentPlan =
    tiers.find((tier) => tier.name === userInfo.subscription) || tiers[0];

  useEffect(() => {
    // Check localStorage for saved subscription and profile data on component mount
    const savedPlan = localStorage.getItem("selectedPlan");
    const savedProfileData = localStorage.getItem("profileData");

    if (savedPlan) {
      setUserInfo((prev) => ({ ...prev, subscription: savedPlan }));
    }

    if (savedProfileData) {
      try {
        const profileData = JSON.parse(savedProfileData);
        setUserInfo((prev) => ({ ...prev, ...profileData }));
      } catch (e) {
        console.error("Error parsing profile data from localStorage", e);
      }
    }
  }, []);

  const handleAuthenticated = (userData) => {
    setIsAuthenticated(true);
    setUserInfo({
      ...userData,
      subscription: userData.subscription || "Free",
      profilePicture: userData.profilePicture || defaultAvatar,
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });

    // Clear error for this field if it exists and now has a value
    if (errors[name] && value.trim()) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to your server or cloud storage
      // For this demo, we'll use a FileReader to get a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo({ ...userInfo, profilePicture: reader.result });
        // Reset the file input so the same file can be selected again if needed
        setFileInputKey(Date.now());
      };
      reader.readAsDataURL(file);
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

      // Save profile data to localStorage (for demo purposes)
      localStorage.setItem(
        "profileData",
        JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          profilePicture: userInfo.profilePicture,
        })
      );

      setEditMode(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo({
      name: "",
      email: "",
      subscription: "",
      profilePicture: defaultAvatar,
    });
    setErrors({});
    // Clear localStorage
    localStorage.removeItem("profileData");
    localStorage.removeItem("selectedPlan");
  };

  const handleChangePlan = () => {
    setShowPlanModal(true);
  };

  const handleSelectPlan = (tier) => {
    setSelectedTier(tier);
  };

  const confirmPlanChange = () => {
    if (selectedTier) {
      setUserInfo({ ...userInfo, subscription: selectedTier.name });
      localStorage.setItem("selectedPlan", selectedTier.name);
      setSelectedTier(null);
      setShowPlanModal(false);
    }
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

    // Clear error for this field if it exists and now has a value
    if (passwordErrors[name] && value.trim()) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    // Validate current password
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    // Validate confirm password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePassword = () => {
    if (validatePasswordForm()) {
      // In a real app, you'd send this to your backend
      console.log("Changing password:", passwordData);

      // Reset form and close modal
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);

      // Show success message (in a real app, you might use a toast notification)
      alert("Password changed successfully!");
    }
  };

  return (
    <div className="flex justify-center items-center mt-12">
      {isAuthenticated ? (
        <Card className="w-full max-w-md bg-gray-900 border-none shadow-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-semibold text-white">
                Your Profile
              </h1>
              <Button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Logout
              </Button>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <img
                  src={userInfo.profilePicture || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
                />
                {editMode && (
                  <div className="absolute bottom-0 right-0">
                    <label
                      htmlFor="profile-picture"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-lg flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                        key={fileInputKey}
                      />
                    </label>
                  </div>
                )}
              </div>
              {editMode && (
                <p className="text-sm text-gray-400">
                  Click the icon to upload a new profile picture
                </p>
              )}
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
                  className={`w-full bg-gray-800 border ${
                    errors.name ? "border-red-500" : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    errors.name ? "focus:ring-red-500" : "focus:ring-indigo-500"
                  }`}
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
                  className={`w-full bg-gray-800 border ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    errors.email
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {errors.email && editMode && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password Change Button (only show when not in edit mode) */}
              {!editMode && (
                <div>
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Change Password
                  </Button>
                </div>
              )}

              {/* Subscription Plan Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Current Subscription
                </h2>
                <div
                  className={`p-4 rounded-lg ${
                    currentPlan.featured
                      ? "bg-indigo-900/30 border border-indigo-500"
                      : "bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {currentPlan.name}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {currentPlan.priceMonthly}
                      </p>
                    </div>
                    <Button
                      onClick={handleChangePlan}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Change Plan
                    </Button>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-300 text-sm mb-2">
                      {currentPlan.description}
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-300">
                      {currentPlan.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
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

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">Choose a New Plan</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`w-64 bg-gray-800 border p-4 rounded-xl cursor-pointer transition-all ${
                    selectedTier?.id === tier.id
                      ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                      : tier.featured
                      ? "border-yellow-500"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => handleSelectPlan(tier)}
                >
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-300 mb-4">{tier.description}</p>
                  <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
                    {tier.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <p className="text-lg font-semibold">{tier.priceMonthly}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedTier(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPlanChange}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                disabled={!selectedTier}
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <Input
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full bg-gray-800 border ${
                    passwordErrors.currentPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    passwordErrors.currentPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <Input
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full bg-gray-800 border ${
                    passwordErrors.newPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    passwordErrors.newPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full bg-gray-800 border ${
                    passwordErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-700"
                  } text-white py-3 px-4 rounded-lg focus:ring-2 ${
                    passwordErrors.confirmPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordErrors({});
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Save New Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

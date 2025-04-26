// pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import Auth from "../components/auth";

// These would typically be fetched from your backend or state management
const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    priceMonthly: 'Free',
    description: "A standard access of our platform.",
    features: ['Can watch on 720p.', '10 free movie access per month'],
    featured: false,
  },
  {
    name: 'Basic',
    id: 'tier-basic',
    priceMonthly: '$49',
    description: "Access to more content in HD.",
    features: ['Can watch on 1080p.', '30 free movie access per month', 'No Ads'],
    featured: false,
  },
  {
    name: 'Premium',
    id: 'tier-premium',
    priceMonthly: '$99',
    description: 'Access for every content on our platform.',
    features: ['Can watch on 4k', 'Unlimited access to any movies', 'No Ads'],
    featured: true,
  },
];

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [userInfo, setUserInfo] = useState({
    name: "J",
    email: "dchach@gmail.com",
    subscription: "Basic" // Default subscription
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // Find the current subscription details
  const currentPlan = tiers.find(tier => tier.name === userInfo.subscription) || tiers[0];

  useEffect(() => {
    // Check localStorage for saved subscription on component mount
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      setUserInfo(prev => ({ ...prev, subscription: savedPlan }));
    }
  }, []);

  const handleAuthenticated = (userData) => {
    setIsAuthenticated(true);
    setUserInfo({ ...userData, subscription: userData.subscription || "Free" });
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
    setUserInfo({ name: "", email: "", subscription: "" });
    setErrors({});
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
      localStorage.setItem('selectedPlan', selectedTier.name);
      setSelectedTier(null);
      setShowPlanModal(false);
    }
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
              
              {/* Subscription Plan Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Current Subscription</h2>
                <div className={`p-4 rounded-lg ${currentPlan.featured ? 'bg-indigo-900/30 border border-indigo-500' : 'bg-gray-800'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentPlan.name}</h3>
                      <p className="text-gray-300 text-sm">{currentPlan.priceMonthly}</p>
                    </div>
                    <Button
                      onClick={handleChangePlan}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Change Plan
                    </Button>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-300 text-sm mb-2">{currentPlan.description}</p>
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
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/30 scale-105' 
                      : tier.featured 
                        ? 'border-yellow-500' 
                        : 'border-gray-700 hover:border-gray-500'
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
    </div>
  );
}
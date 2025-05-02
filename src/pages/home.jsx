import React, { useEffect } from "react";
import { Button } from "../components/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // Helper function to check if the user is properly authenticated
  const isAuthenticated = () => {
    const authToken = localStorage.getItem("authToken");
    const profileData = localStorage.getItem("profileData");

    // Only consider the user authenticated if both pieces of data exist
    return authToken && profileData;
  };

  useEffect(() => {
    // Check for partial authentication state (incomplete logout) and clean it up if necessary
    const authToken = localStorage.getItem("authToken");
    const profileData = localStorage.getItem("profileData");

    if ((authToken && !profileData) || (!authToken && profileData)) {
      // Partial logout detected - clear all authentication data
      console.log("Cleaning up incomplete logout state");
      localStorage.removeItem("authToken");
      localStorage.removeItem("profileData");
      localStorage.removeItem("selectedPlan");
    }
  }, []);

  const handleStartNow = () => {
    // Use the helper function to check authentication
    if (isAuthenticated()) {
      // User is authenticated, navigate to movies page
      navigate("/movies");
    } else {
      // User is not authenticated, navigate to profile page for login/register
      navigate("/profile");
    }
  };

  // Always show the landing page first
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center gap-2">
        Welcome to Been Chillin <span>🎬</span>
      </h1>
      <p className="text-lg text-gray-400 mb-8">
        "Start chilling with us, stream your favorite movie anytime and
        anywhere"
      </p>
      <Button
        className="px-6 py-3 text-base bg-violet-600 hover:bg-violet-700 rounded-xl"
        onClick={handleStartNow}
      >
        Start Now
      </Button>
    </div>
  );
}

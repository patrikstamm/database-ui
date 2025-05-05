// pages/home.jsx
import React, { useEffect } from "react";
import { Button } from "../components/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/authContext";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    if (isAuthenticated) {
      // User is authenticated, navigate directly to movies page
      navigate("/movies");
    } else {
      // User is not authenticated, store the redirect in localStorage and navigate to profile
      localStorage.setItem("redirectAfterLogin", "movies");
      navigate("/profile");
    }
  };

  // Updated layout with full height and better positioning
  return (
    <div className="flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6 mx-auto max-w-6xl min-h-screen">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 mt-12">
          Welcome to Been Chillin <span className="text-purple-500">🎬</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl">
          "Start chilling with us, stream your favorite movie anytime and
          anywhere"
        </p>
        <Button
          className="px-8 py-4 text-lg bg-violet-600 hover:bg-violet-700 rounded-xl w-full max-w-md mb-16"
          onClick={handleStartNow}
        >
          Start Now
        </Button>

        {/* Featured Content Section */}
        <div className="mt-8 w-full">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Featured Content
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-gray-800/50 rounded-lg overflow-hidden shadow-lg hover:bg-gray-800/70 transition-all duration-300"
              >
                <div className="h-32 flex items-center justify-center">
                  <span className="text-4xl text-purple-400">🎬</span>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-white text-lg">
                    Coming Soon
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    New releases every week
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

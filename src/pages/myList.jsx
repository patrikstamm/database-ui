// pages/MyList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import apiService from "../components/services/api";
import { useAuth } from "../components/context/authContext";

const MyList = () => {
  const [myListMovies, setMyListMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use the authentication context
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);

        // Check for authentication
        if (!isAuthenticated || !user) {
          setError("Please log in to view your Watch Later list");
          setLoading(false);
          return;
        }

        // Get user ID
        const userId = user.id;

        // Fetch favorites from backend
        let favorites = [];
        try {
          const favoritesResponse = await apiService.favorites.getUserFavorites(
            userId
          );

          if (favoritesResponse.data && Array.isArray(favoritesResponse.data)) {
            // Extract content IDs from the response
            favorites = favoritesResponse.data.map((item) => {
              // Handle different API response formats
              if (item.content_id) return item.content_id;
              return item.ContentID;
            });
          }
        } catch (favoritesError) {
          console.error("Error fetching favorites:", favoritesError);
          // Fall back to local storage if available
          const localFavorites = JSON.parse(
            localStorage.getItem("myList") || "[]"
          );
          favorites = localFavorites;
        }

        if (favorites.length === 0) {
          setMyListMovies([]);
          setLoading(false);
          return;
        }

        // Fetch all content and filter for favorites
        try {
          const contentsResponse = await apiService.content.getAllContent();

          if (contentsResponse.data && Array.isArray(contentsResponse.data)) {
            // Filter contents to only include favorites
            const favoriteMovies = contentsResponse.data
              .filter((content) => {
                const contentId = content.ContentID;
                return favorites.includes(contentId);
              })
              .map((content) => ({
                id: content.ContentID,
                title: content.Title,
                description: content.Description,
                poster: content.ThumbnailURL || "/api/placeholder/400/600",
                genres: content.Categories || [],
              }));

            setMyListMovies(favoriteMovies);
          }
        } catch (contentsError) {
          console.error("Error fetching content details:", contentsError);
          setError("Failed to load movie details for your favorites");
        }

        setLoading(false);
      } catch (error) {
        console.error("Fatal error:", error);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, user]);

  const removeFromList = async (movieId) => {
    try {
      // Check for authentication
      if (!isAuthenticated || !user) {
        navigate("/profile");
        return;
      }

      // Get user ID
      const userId = user.id;

      // Delete from favorites using service
      await apiService.favorites.removeFavorite(userId, movieId);

      // Update UI
      setMyListMovies(myListMovies.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error("Error removing from list:", error);
      alert("Failed to remove from Watch Later list. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 text-center">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        {error.includes("log in") ? (
          <Button
            className="bg-indigo-600"
            onClick={() => navigate("/profile")}
          >
            Log In
          </Button>
        ) : (
          <Button
            className="bg-indigo-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-white">Watch Later</h1>

      {myListMovies.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-400 mb-4">
            Your Watch Later list is empty
          </p>
          <p className="text-gray-500 mb-6">
            Add movies to your list while browsing
          </p>
          <Link
            to="/movies"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {myListMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => removeFromList(movie.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <Link to={`/movie/${movie.id}`}>
                  <h3 className="font-semibold text-lg hover:text-indigo-400 transition text-white">
                    {movie.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 mt-1">
                  {movie.genres?.join(", ") || ""}
                </p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {movie.description}
                </p>
                <Link to={`/movie/${movie.id}`}>
                  <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700">
                    Watch Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;

// pages/MovieDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../components/button";
import ReviewSection from "../components/reviewSection";
import apiService from "../components/services/api";
import { useAuth } from "../components/context/authContext";
import {
  normalizeContent,
  getYouTubeEmbedUrl,
} from "../components/contentHelp"; 

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the authentication context
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);

        // Check authentication
        if (!isAuthenticated) {
          setLoading(false);
          return; // Don't attempt to fetch if not authenticated
        }

        // Fetch all contents since we don't have a specific endpoint for one movie
        const response = await apiService.content.getAllContent();

        // Find the specific movie
        const foundMovie = response.data.find(
          (m) => String(m.ContentID) === String(id)
        );

        if (foundMovie) {
          // Normalize movie data
          const movieData = normalizeContent(foundMovie);
          setMovie(movieData);

          // Record this in watch history
          try {
            if (user) {
              const userId = user.id;
              // Add to watch history
              await apiService.history.recordWatch(userId, id);
            }

            // Also update localStorage for client-side recently watched feature
            const recentIds = JSON.parse(
              localStorage.getItem("recentlyWatched") || "[]"
            );
            const newRecentIds = [
              id,
              ...recentIds.filter(
                (recentId) => String(recentId) !== String(id)
              ),
            ].slice(0, 10);
            localStorage.setItem(
              "recentlyWatched",
              JSON.stringify(newRecentIds)
            );
          } catch (historyError) {
            console.error("Error updating watch history:", historyError);
            // Non-critical error, continue showing the movie
          }
        } else {
          setError("Movie not found");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError(
          "Could not load movie details: " + (err.message || "Unknown error")
        );
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, isAuthenticated, user, navigate]);

  // Add to favorites handler
  const handleAddToFavorites = async () => {
    try {
      // Check authentication
      if (!isAuthenticated) {
        navigate("/profile?redirect=movie/" + id);
        return;
      }
      // Get user ID
      if (!user) {
        console.error("User not available");
        return;
      }

      const userId = user.id;
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      // Add to favorites
      await apiService.favorites.addFavorite(userId, id);

      alert("Added to Watch Later list!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      if (error.response && error.response.status === 409) {
        alert("This movie is already in your Watch Later list.");
      } else {
        alert("Failed to add to Watch Later list. Please try again.");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="text-center mt-10 text-white">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-300 mb-6">
          Please log in to view movie details.
        </p>
        <Button
          className="bg-indigo-600"
          onClick={() => navigate("/profile?redirect=movie/" + id)}
        >
          Log In
        </Button>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="text-center mt-10 text-white">
        <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
        <p className="text-gray-300 mb-4">
          {error || "The requested movie could not be found."}
        </p>
        <Button className="bg-indigo-600" onClick={() => navigate("/movies")}>
          Back to Movies
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Movie Poster */}
        <div className="md:w-1/3">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full rounded-xl shadow-lg"
          />

          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                // Attempt to scroll to video section
                const videoSection = document.getElementById("video-player");
                if (videoSection) {
                  videoSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Watch Now
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleAddToFavorites}
            >
              Add to Watch Later
            </Button>
          </div>
        </div>

        {/* Movie Info */}
        <div className="md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres &&
              movie.genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-200"
                >
                  {genre}
                </span>
              ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-gray-300">
            <div>
              <span className="block text-gray-500">Year</span>
              <span>{movie.year}</span>
            </div>
            <div>
              <span className="block text-gray-500">Director</span>
              <span>{movie.director}</span>
            </div>
            <div>
              <span className="block text-gray-500">Duration</span>
              <span>{movie.duration}</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {movie.description}
          </p>

          <div className="relative pt-6" id="video-player">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800"></div>

            {/* Video player - Now uses YouTube iframe if available */}
            {movie.videoUrl ? (
              <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(movie.videoUrl)}
                  title={movie.title}
                  className="w-full h-full"
                  style={{ minHeight: "360px" }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="bg-black h-96 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-2 text-indigo-500"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                  <p className="text-gray-400">
                    Preview not available. Click to watch the full movie.
                  </p>
                </div>
              </div>
            )}

            {/* Additional movie info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">More Details</h2>

              {movie.languages && movie.languages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-400">
                    Available Languages
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {movie.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.subtitles && movie.subtitles.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-400">
                    Subtitles
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {movie.subtitles.map((subtitle, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                      >
                        {subtitle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.rating > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-400">Rating</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500 text-xl mr-2">★</span>
                    <span>{movie.rating.toFixed(1)}/10</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewSection contentId={id} />
        </div>
      </div>
    </div>
  );
}

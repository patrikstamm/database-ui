import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../components/button";
import ReviewSection from "../components/reviewSection";
import api from "../components/services/api"; // Import your API

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/movie/${id}` } });
      return;
    }

    // If we're authenticated, fetch the movie data
    setLoading(true);

    // First try fetching all movies if we don't have a direct endpoint for one movie
    api
      .get("/contents")
      .then((response) => {
        // Find the specific movie in the response data
        const foundMovie = response.data.find(
          (m) => m.ContentID?.toString() === id?.toString()
        );

        if (foundMovie) {
          const movieData = {
            id: foundMovie.ContentID,
            title: foundMovie.Title,
            description: foundMovie.Description,
            poster: foundMovie.PosterURL,
            genres: foundMovie.Genres || [],
          };
          setMovie(movieData);
        } else {
          setError("Movie not found in the database");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movie details:", err);

        // For non-401 errors, show an error message (401 will be handled by interceptor)
        if (!err.response || err.response.status !== 401) {
          setError(
            "Could not load movie details: " + (err.message || "Unknown error")
          );
        }
        setLoading(false);
      });
  }, [id, isAuthenticated, navigate]);

  // Add a listener for auth changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    // Listen for storage changes (in case user logs out in another tab)
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="text-center mt-10 text-white">
        <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
        <p className="text-gray-300">
          {error || "The requested movie could not be found."}
        </p>
        <Button className="mt-4" onClick={() => navigate("/")}>
          Back to Movies
        </Button>
      </div>
    );
  }
}

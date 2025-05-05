// Movies.jsx component with better error handling for watch history
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import apiService from "../components/services/api";
import { useAuth } from "../components/context/authContext";
import { normalizeContent, formatCategories } from "../components/contentHelp";

export default function Movies() {
  // Component state
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [moviesData, setMoviesData] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use the authentication context
  const { isAuthenticated, user } = useAuth();

  // Fetch all movies when component mounts
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);

      try {
        const response = await apiService.content.getAllContent();

        // Process movie data - normalize field names
        const movies = response.data.map((movie) => normalizeContent(movie));

        setMoviesData(movies);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies. Please try again later.");
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Extract all unique genres from the data
  const allGenres = [
    "All",
    ...new Set(moviesData.flatMap((movie) => movie.genres || [])),
  ];

  // Filter movies based on search term and selected genre
  const filteredMovies = moviesData.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGenre =
      selectedGenre === "All" || movie.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  // Get recently watched movies from local storage and backend
  useEffect(() => {
    if (!isAuthenticated || !user || moviesData.length === 0) return;

    // Use fallback to localStorage function
    const fallbackToLocalStorage = () => {
      try {
        const recentIds = JSON.parse(
          localStorage.getItem("recentlyWatched") || "[]"
        );
        const recentMovies = recentIds
          .map((id) => {
            // Convert id to number if it's a string number
            const numId =
              typeof id === "string" && !isNaN(parseInt(id))
                ? parseInt(id)
                : id;

            return moviesData.find((movie) => {
              const movieId =
                typeof movie.id === "string" && !isNaN(parseInt(movie.id))
                  ? parseInt(movie.id)
                  : movie.id;

              return movieId === numId;
            });
          })
          .filter((movie) => movie !== undefined)
          .slice(0, 4);

        setRecentlyWatched(recentMovies);
      } catch (error) {
        console.error("Error with localStorage fallback:", error);
        setRecentlyWatched([]);
      }
    };

    try {
      // Try to get watch history from backend
      if (user.id) {
        apiService.history
          .getUserHistory(user.id)
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              // Extract content IDs from history, sorted by timestamp (newest first)
              const recentContentIds = response.data
                .sort(
                  (a, b) =>
                    new Date(b.watched_timestamp) -
                    new Date(a.watched_timestamp)
                )
                .map((item) => item.content_id)
                .slice(0, 4); // Limit to 4 most recent

              // Map IDs to movie objects
              const recentMovies = recentContentIds
                .map((id) => {
                  // Convert id to number if it's a string number
                  const numId =
                    typeof id === "string" && !isNaN(parseInt(id))
                      ? parseInt(id)
                      : id;

                  return moviesData.find((movie) => {
                    const movieId =
                      typeof movie.id === "string" && !isNaN(parseInt(movie.id))
                        ? parseInt(movie.id)
                        : movie.id;

                    return movieId === numId;
                  });
                })
                .filter((movie) => movie !== undefined);

              setRecentlyWatched(recentMovies);
            }
          })
          .catch((error) => {
            console.error("Error fetching watch history:", error);
            // Fallback to localStorage if API failed
            fallbackToLocalStorage();
          });
      } else {
        // If no user ID, use localStorage
        fallbackToLocalStorage();
      }
    } catch (error) {
      console.error("Error in recently watched logic:", error);
      fallbackToLocalStorage();
    }
  }, [moviesData, isAuthenticated, user]);

  // Add a movie to the user's favorites list
  const handleAddToFavorites = async (movieId) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        navigate("/profile");
        return;
      }

      // Get user ID
      const userId = user?.id;
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      // Add to favorites using service
      await apiService.favorites.addFavorite(userId, movieId);

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

  // Handle watching a movie
  const handleWatchMovie = async (movieId) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/profile");
      return;
    }

    try {
      // Record in localStorage for fallback
      const recentIds = JSON.parse(
        localStorage.getItem("recentlyWatched") || "[]"
      );

      // Convert movieId to number if it's a string number
      const numMovieId =
        typeof movieId === "string" && !isNaN(parseInt(movieId))
          ? parseInt(movieId)
          : movieId;

      const newRecentIds = [
        numMovieId,
        ...recentIds.filter((id) => {
          // Convert id to number if it's a string number
          const numId =
            typeof id === "string" && !isNaN(parseInt(id)) ? parseInt(id) : id;

          return numId !== numMovieId;
        }),
      ].slice(0, 10);

      localStorage.setItem("recentlyWatched", JSON.stringify(newRecentIds));

      // Record in backend watch history if authenticated
      if (isAuthenticated && user && user.id) {
        try {
          const userId = user.id;
          await apiService.history.recordWatch(userId, movieId);
        } catch (apiError) {
          console.error("Error recording watch history:", apiError);
          // Non-critical error, continue to movie page
        }
      }

      // Navigate to movie page
      navigate(`/movie/${movieId}`);
    } catch (error) {
      console.error("Error:", error);
      // Still navigate to movie page
      navigate(`/movie/${movieId}`);
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
      <div className="max-w-6xl mx-auto mt-6 p-4 text-center">
        <p className="text-red-500 text-xl">{error}</p>
        <Button
          className="mt-4 bg-indigo-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 p-4">
      {/* Search and Genre Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Search for a movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 text-white"
        />

        {allGenres.length > 1 && (
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            {allGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Recently Watched Section */}
      {isAuthenticated && recentlyWatched.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Continue Watching
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyWatched.map((movie) => (
              <Card
                key={`recent-${movie.id}`}
                className="bg-gray-800 border-none shadow-xl"
              >
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <div className="h-1 bg-gray-700 rounded-full">
                      <div
                        className="h-1 bg-indigo-600 rounded-full"
                        style={{ width: `${Math.random() * 90 + 10}%` }}
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-md font-semibold truncate">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-indigo-300 mt-1 truncate">
                    {movie.genres && formatCategories(movie.genres)}
                  </p>
                  <Button
                    className="mt-2 w-full py-1 text-sm"
                    onClick={() => handleWatchMovie(movie.id)}
                  >
                    Resume
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Movies Section */}
      <div>
        {recentlyWatched.length > 0 && (
          <h2 className="text-2xl font-bold mb-4 text-white">All Movies</h2>
        )}

        {filteredMovies.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-10">
            No movies found for your search and selected genre.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                className="bg-gray-800 border-none shadow-xl"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-t-xl"
                />
                <CardContent>
                  <h2 className="text-xl font-semibold mt-2">{movie.title}</h2>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {movie.description}
                  </p>
                  <p className="text-sm text-indigo-300 mt-1">
                    {movie.genres && formatCategories(movie.genres)}
                  </p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => handleWatchMovie(movie.id)}
                  >
                    Watch Now
                  </Button>
                  <Button
                    className="mt-2 w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleAddToFavorites(movie.id)}
                  >
                    Watch Later
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

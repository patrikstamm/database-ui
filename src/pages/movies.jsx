import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import moviesData from "../exampleData/movieData.json";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";

export default function Movies() {
  const [search, setSearch] = useState("");
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const navigate = useNavigate();

  const filteredMovies = moviesData.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  // Load recently watched movies on component mount
  useEffect(() => {
    const recentMoviesIds = JSON.parse(localStorage.getItem("recentlyWatched") || "[]");
    
    // Find the movie data for each ID and limit to 4 most recent
    const recentMovies = recentMoviesIds
      .map(id => moviesData.find(movie => movie.id === id))
      .filter(movie => movie !== undefined)
      .slice(0, 4);
      
    setRecentlyWatched(recentMovies);
  }, []);

  const handleAddToList = (movieId) => {
    const existingList = JSON.parse(localStorage.getItem("myList")) || [];
    if (!existingList.includes(movieId)) {
      const updatedList = [...existingList, movieId];
      localStorage.setItem("myList", JSON.stringify(updatedList));
      alert("Movie added to your list!");
    } else {
      alert("This movie is already in your list.");
    }
  };

  const handleWatchMovie = (movieId) => {
    // Get current recently watched list
    const recentMoviesIds = JSON.parse(localStorage.getItem("recentlyWatched") || "[]");
    
    // Remove the movie ID if it already exists to avoid duplicates
    const filteredIds = recentMoviesIds.filter(id => id !== movieId);
    
    // Add the movie ID to the beginning of the array (most recent)
    const updatedIds = [movieId, ...filteredIds].slice(0, 10); // Keep only 10 most recent
    
    // Save back to localStorage
    localStorage.setItem("recentlyWatched", JSON.stringify(updatedIds));
    
    // Navigate to the movie page
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-4">
      <div className="mb-6">
        <Input
          placeholder="Search for a movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 text-white"
        />
      </div>

      {/* Recently Watched Section */}
      {recentlyWatched.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Continue Watching</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyWatched.map((movie) => (
              <Card key={`recent-${movie.id}`} className="bg-gray-800 border-none shadow-xl">
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
                  <h3 className="text-md font-semibold truncate">{movie.title}</h3>
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
        {recentlyWatched.length > 0 && <h2 className="text-2xl font-bold mb-4 text-white">All Movies</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <Card key={movie.id} className="bg-gray-800 border-none shadow-xl">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-t-xl"
              />
              <CardContent>
                <h2 className="text-xl font-semibold mt-2">{movie.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{movie.description}</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => handleWatchMovie(movie.id)}
                >
                  Watch Now
                </Button>
                <Button
                  className="mt-2 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleAddToList(movie.id)}
                >
                  Add to My List
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
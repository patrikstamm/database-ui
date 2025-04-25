import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moviesData from "../exampleData/movieData.json"; // 👈 load full movie list

const MyList = () => {
  const [myListMovies, setMyListMovies] = useState([]);

  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem("myList")) || [];
    const matchedMovies = moviesData.filter((movie) =>
      savedIds.includes(movie.id)
    );
    setMyListMovies(matchedMovies);
  }, []);

  const removeFromList = (movieId) => {
    const updatedIds = myListMovies
      .filter((movie) => movie.id !== movieId)
      .map((m) => m.id);

    localStorage.setItem("myList", JSON.stringify(updatedIds));

    const matchedMovies = moviesData.filter((movie) =>
      updatedIds.includes(movie.id)
    );
    setMyListMovies(matchedMovies);
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My List</h1>

      {myListMovies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400 mb-4">Your list is empty</p>
          <p className="text-gray-500 mb-6">Add movies to your list while browsing</p>
          <Link
            to="/movies"
            className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 transition"
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
                  <h3 className="font-semibold text-lg hover:text-yellow-400 transition">
                    {movie.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400">
                  {movie.year} • {movie.genre}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;

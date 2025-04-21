import { useState } from "react";
import moviesData from "../exampleData/movieData.json";
import { Card, CardContent } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";

export default function Movies() {
  const [search, setSearch] = useState("");

  const filteredMovies = moviesData.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

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
              <p className="text-sm text-gray-400 mt-1">
                {movie.description}
              </p>
              <Button className="mt-4 w-full">Watch Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

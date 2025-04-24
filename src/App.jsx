import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Movies from "./pages/movies";
import Profile from "./pages/profile";
import MovieDetail from "./pages/movieDetail";
import Plan from "./pages/plan";

export default function MovieStreamingApp() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
    </div>
  );
}


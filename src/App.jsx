// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Movies from "./pages/movies";
import Profile from "./pages/profile";
import MovieDetail from "./pages/movieDetail";
import Plan from "./pages/plan";
import MyList from "./pages/myList";
import { AuthProvider } from "./components/context/authContext";

export default function MovieStreamingApp() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/mylist" element={<MyList />} />
            <Route
              path="/my-list"
              element={<Navigate to="/mylist" replace />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/login" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
          <p>© 2025 Been Chillin'. All rights reserved.</p>
        </footer>
      </div>
    </AuthProvider>
  );
}


import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">🎬 Been Chillin</h1>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:text-yellow-400 transition">Home</Link>
          </li>
          <li>
            <Link to="/movies" className="hover:text-yellow-400 transition">Movies</Link>
          </li>
          <li>
            <Link to="/profile" className="hover:text-yellow-400 transition">Profile</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";

export function Input({ className = '', ...props }) {
    return (
      <input
        className={`w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      />
    );
  }
  
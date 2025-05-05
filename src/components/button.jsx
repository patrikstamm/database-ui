import React from "react";
export function Button({ children, className = '', ...props }) {
    return (
      <button
        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-xl w-full ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  
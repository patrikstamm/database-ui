import React from "react";
export function Card({ children, className }) {
    return <div className={`rounded-2xl p-4 bg-gray-800 shadow ${className}`}>{children}</div>;
  }
  
  export function CardContent({ children }) {
    return <div className="mt-2">{children}</div>;
  }
  
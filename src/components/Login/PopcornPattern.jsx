import React from "react";

const PopcornPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute text-4xl animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          transition: "all 1s ease",
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${8 + Math.random() * 4}s`,
        }}
      >
        🍿
      </div>
    ))}
  </div>
);

export default PopcornPattern;
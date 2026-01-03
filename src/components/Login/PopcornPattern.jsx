import React from "react";
import Icon from "../Icon";

const PopcornPattern = () => (
  <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          transition: "all 1s ease",
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${8 + Math.random() * 4}s`,
        }}
      >
        <Icon name="popcorn" className="w-10 h-10 text-white" strokeWidth={2} />
      </div>
    ))}
  </div>
);

export default PopcornPattern;
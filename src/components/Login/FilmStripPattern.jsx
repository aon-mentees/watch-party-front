import React from "react";

const FilmStripPattern = () => (
  <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="absolute top-0 left-0 right-0 h-8 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
    <div className="absolute top-0 bottom-0 left-0 w-6 flex flex-col justify-around">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-4 bg-white/30"></div>
      ))}
    </div>
    <div className="absolute top-0 bottom-0 right-0 w-6 flex flex-col justify-around">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-4 bg-white/30"></div>
      ))}
    </div>
  </div>
);

export default FilmStripPattern;
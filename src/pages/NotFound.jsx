import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transition: "all 1s ease",
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Floating Popcorn */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
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

      {/* 404 Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Broken Film Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="text-9xl opacity-20">🎬</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] bg-clip-text text-transparent">
                404
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-white/75 mb-8">
          Oops! Looks like this movie hasn't been released yet. The page you're looking for doesn't exist.
        </p>

        {/* Animated Play Button */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-linearto-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] opacity-30 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] flex items-center justify-center">
              <div className="w-0 h-0 border-t-12 border-t-transparent border-l-20 border-l-white border-b-12 border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-8 py-3 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
          >
            Go Back
          </button>
        </div>

        {/* Fun Message */}
        <p className="mt-12 text-sm text-white/50">
          🎭 Maybe try searching for something else? The show must go on!
        </p>
      </div>
    </div>
  );
};

export default NotFound;
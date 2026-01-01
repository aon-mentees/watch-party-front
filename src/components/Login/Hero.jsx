import React from "react";

const Hero = ({ type, active, title, text, buttonText, onClick }) => {
  const baseClasses = "absolute w-1/2 h-full flex flex-col items-center justify-center gap-4 text-center px-6 z-10 transition-all duration-700";
  const visibilityClasses = active ? "opacity-100 visible" : "opacity-0 invisible";
  
  let positionClasses = "";
  if (type === "signup") {
    positionClasses = active ? "left-0 translate-x-0" : "left-0 -translate-x-full";
  } else {
    positionClasses = active ? "left-1/2 translate-x-0" : "left-1/2 translate-x-full";
  }

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${positionClasses} hidden md:flex`}>
      {/* Animated Play Button Icon */}
      <div className="relative w-20 h-20 mb-2">
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
        <div className="relative w-20 h-20 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
          <div className="w-0 h-0 border-t-12 border-t-transparent border-l-20 border-l-white border-b-12 border-b-transparent ml-1"></div>
        </div>
      </div>
      
      <h2 className="text-2xl font-medium text-white">{title}</h2>
      <p className="text-white/75 leading-relaxed mb-1.5">{text}</p>
      <button
        type="button"
        onClick={onClick}
        className="px-10 py-3 rounded-full tracking-wider border border-white text-white bg-transparent transition-all duration-300 hover:bg-white hover:text-[#c41e3a]"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default Hero;
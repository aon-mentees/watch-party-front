import React, { useState } from "react";
import Hero from "../components/Login/Hero";
import AuthForm from "../components/Login/AuthForm";
import MobileAuthForm from "../components/Login/MobileAuthForm";
import PopcornPattern from "../components/Login/PopcornPattern";
import FilmStripPattern from "../components/Login/FilmStripPattern";
import "../assets/styles/Login/animations.css";

function Login() {
  const [view, setView] = useState("signup");

  const isSignup = view === "signup";
  const toggleView = () => setView(isSignup ? "signin" : "signup");

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white flex items-center justify-center overflow-hidden relative px-4">
      {/* Animated Background Elements */}
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

      {/* Desktop Version - Sliding Card */}
      <div className="hidden md:block relative w-165 h-110 rounded-2xl bg-[#0d0a12] shadow-[0_12px_80px_rgba(196,30,58,0.3)] overflow-hidden border border-red-900/20">
        {/* Popcorn Pattern */}
        <PopcornPattern />
        
        {/* Sliding Background with Movie Theme Gradient */}
        <div 
          className="absolute z-2 top-0 left-0 bottom-0 w-1/2 bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] transition-transform duration-700 shadow-2xl"
          style={{ transform: isSignup ? "translateX(0)" : "translateX(100%)" }}
        >
          {/* Film Strip Pattern on gradient */}
          <FilmStripPattern />
        </div>

        {/* Hero Section for Signup (Left side when active) */}
        <Hero
          type="signup"
          active={isSignup}
          title="Ready to Watch?"
          text="Sign in to join your friends and start streaming together."
          buttonText="SIGN IN"
          onClick={toggleView}
        />

        {/* Signup Form (Right side when active) */}
        <AuthForm
          type="signup"
          active={isSignup}
          title="Create Account"
          isSignup={true}
        />

        {/* Hero Section for Signin (Right side when active) */}
        <Hero
          type="signin"
          active={!isSignup}
          title="New to Watch Party?"
          text="Create an account and start hosting epic watch parties with friends."
          buttonText="SIGN UP"
          onClick={toggleView}
        />

        {/* Signin Form (Left side when active) */}
        <AuthForm
          type="signin"
          active={!isSignup}
          title="Sign In"
          isSignup={false}
        />
      </div>

      {/* Mobile Version - Stacked Layout */}
      <div className="md:hidden w-full max-w-md">
        <div className="relative rounded-2xl bg-[#0d0a12] shadow-[0_12px_80px_rgba(196,30,58,0.3)] overflow-hidden border border-red-900/20 p-6">
          <PopcornPattern />

          {/* Tab Switcher */}
          <div className="relative z-10 flex rounded-full bg-[#1a1520] p-1 mb-6">
            <button
              onClick={() => setView("signup")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                isSignup
                  ? "bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white shadow-lg"
                  : "text-[#8d889d] hover:text-white"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setView("signin")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                !isSignup
                  ? "bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white shadow-lg"
                  : "text-[#8d889d] hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Mobile Form */}
          <div className="relative z-10">
            <MobileAuthForm isSignup={isSignup} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
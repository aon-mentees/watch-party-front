import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/authService";

const MobileAuthForm = ({ isSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Sign Up
        if (!formData.username || !formData.email || !formData.password) {
          toast.error("❌ All fields are required!");
          setLoading(false);
          return;
        }
        await authService.signUp(formData.username, formData.email, formData.password);
        toast.success(`🎬 Welcome ${formData.username}! Account created successfully!`);
      } else {
        // Sign In
        if (!formData.email || !formData.password) {
          toast.error("❌ Email and password are required!");
          setLoading(false);
          return;
        }
        const result = await authService.signIn(formData.email, formData.password);
        toast.success(`🍿 Welcome back, ${result.user.username}!`);
      }

      // Success - navigate to home after a short delay
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full px-6">
      {/* Play Button Icon */}
      <div className="relative w-16 h-16 mb-2">
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] opacity-30 animate-ping"></div>
        <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] flex items-center justify-center">
          <div className="w-0 h-0 border-t-10 border-t-transparent border-l-16 border-l-white border-b-10 border-b-transparent ml-1"></div>
        </div>
      </div>

      <h2 className="text-xl font-medium text-white text-center mb-2">
        {isSignup ? "Create Account 🎬" : "Sign In 🍿"}
      </h2>

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {isSignup && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
          />
        )}
        <input
          type="email"
          name="email"
          placeholder={isSignup ? "Email" : "Email or Username"}
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
        />
        
        {!isSignup && (
          <a href="#" className="text-sm mt-2 text-[#8d889d] hover:text-white transition-colors">
            Forgot password?
          </a>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2 px-0 py-3 rounded-full text-white bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : isSignup ? "SIGN UP" : "SIGN IN"}
        </button>
      </div>
    </div>
  );
};

export default MobileAuthForm;
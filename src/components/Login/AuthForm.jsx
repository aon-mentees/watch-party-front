import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/authService";

const AuthForm = ({ type, active, title, isSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const baseClasses = "absolute w-1/2 h-full flex flex-col justify-center items-center gap-4 px-8 z-0 transition-all duration-700";
  const visibilityClasses = active ? "opacity-100 visible" : "opacity-0 invisible";
  
  let positionClasses = "";
  if (type === "signup") {
    positionClasses = active ? "left-1/2 translate-x-0" : "left-1/2 translate-x-full";
  } else {
    positionClasses = active ? "left-0 translate-x-0" : "left-0 -translate-x-full";
  }

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
        if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.password) {
          toast.error("❌ All fields are required!");
          setLoading(false);
          return;
        }
        
        const phoneRegex = /^[\d\s\-+()]{10,}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          toast.error("❌ Please enter a valid phone number!");
          setLoading(false);
          return;
        }

        const result = await authService.signUp({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
        });
        
        toast.success(`🎬 Welcome ${formData.fullName}! Account created successfully!`); 
        
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        // Sign In
        if (!formData.email || !formData.password) {
          toast.error("❌ Email and password are required!");
          setLoading(false);
          return;
        }
        
        const result = await authService.signIn({
          email: formData.email,
          password: formData.password,
        });
        
        const userName = result.user?.fullName || result.user?.email || "User";
        toast.success(`🍿 Welcome back, ${userName}!`);

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }

      setLoading(false);
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        password: "",
      });
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${positionClasses} hidden md:flex`}>
      <h2 className="text-2xl font-medium text-white text-center flex items-center gap-2 justify-center">
        {title} {isSignup ? "🎬" : "🍿"}
      </h2>
      
      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {isSignup && (
          <>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3.5 text-white placeholder:text-[#8d889d] disabled:opacity-50"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3.5 text-white placeholder:text-[#8d889d] disabled:opacity-50"
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3.5 text-white placeholder:text-[#8d889d] disabled:opacity-50"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3.5 text-white placeholder:text-[#8d889d] disabled:opacity-50"
        />
        
        {!isSignup && (
          <a href="#" className="text-sm mt-2.5 text-[#8d889d] hover:text-white transition-colors">
            Forgot password?
          </a>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-40 mt-2.5 px-0 py-3.5 rounded-full text-white bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : isSignup ? "SIGN UP" : "SIGN IN"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
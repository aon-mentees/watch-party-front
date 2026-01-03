import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import Icon from "../Icon";

const MobileAuthForm = ({ isSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
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
        if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.password) {
          toast.error("All fields are required!", {
            icon: <Icon name="close" className="w-5 h-5" strokeWidth={2} />,
          });
          setLoading(false);
          return;
        }
        
        const phoneRegex = /^[\d\s\-+()]{10,}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          toast.error("Please enter a valid phone number!", {
            icon: <Icon name="warning" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
          });
          setLoading(false);
          return;
        }

        const result = await authService.signUp({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
        });
        
        console.log("SignUp success:", result);
        toast.success(`Welcome ${formData.fullName}! Account created successfully!`, {
          icon: <Icon name="clapper" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
        });
        
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          password: "",
        });
        setLoading(false);
      } else {
        if (!formData.email || !formData.password) {
          toast.error("Email and password are required!", {
            icon: <Icon name="close" className="w-5 h-5" strokeWidth={2} />,
          });
          setLoading(false);
          return;
        }
        const result = await authService.signIn({
          email: formData.email,
          password: formData.password,
        });
        
        console.log("SignIn success:", result);
        const userName = result.user?.fullName || result.user?.email || "User";
        toast.success(`Welcome back, ${userName}!`, {
          icon: <Icon name="popcorn" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
        });
        
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          password: "",
        });
        setLoading(false);
      }

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err.message, {
        icon: <Icon name="warning" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
      });
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

      <h2 className="text-xl font-medium text-white text-center mb-2 flex items-center justify-center gap-2">
        <Icon
          name={isSignup ? "clapper" : "popcorn"}
          className="w-5 h-5 text-white"
          strokeWidth={2}
        />
        <span>{isSignup ? "Create Account" : "Sign In"}</span>
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
              className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3 text-white placeholder:text-[#8d889d] disabled:opacity-50"
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
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import Icon from "../Icon";

const AuthForm = ({ type, active, title, isSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const formatPhone = (raw) => {
    const cleaned = (raw || "").replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+964")) return cleaned;
    if (cleaned.startsWith("964")) return `+${cleaned}`;
    if (cleaned.startsWith("0")) return `+964${cleaned.slice(1)}`;
    if (/^7\d{9}$/.test(cleaned)) return `+964${cleaned}`;
    return cleaned;
  };

  const baseClasses = "absolute w-1/2 h-full flex flex-col justify-center items-center gap-4 px-8 z-0 transition-all duration-700";
  const visibilityClasses = active ? "opacity-100 visible" : "opacity-0 invisible";
  
  let positionClasses = "";
  if (type === "signup") {
    positionClasses = active ? "left-1/2 translate-x-0" : "left-1/2 translate-x-full";
  } else {
    positionClasses = active ? "left-0 translate-x-0" : "left-0 -translate-x-full";
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "");
      // Limit to 10 or 11 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      setFormData({ ...formData, phoneNumber: limitedDigits });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
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

        const formattedPhone = formatPhone(formData.phoneNumber);
        if (!/^\+964\d{10}$/.test(formattedPhone)) {
          toast.error("Phone must be an Iraqi number with 10 digits.", {
            icon: <Icon name="warning" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
          });
          setLoading(false);
          return;
        }

        const result = await authService.signUp({
          fullName: formData.fullName,
          phoneNumber: formattedPhone,
          email: formData.email,
          password: formData.password,
        });
        
        console.log("SignUp success:", result);
        toast.success(`Welcome ${formData.fullName}! Account created successfully!`, {
          icon: <Icon name="clapper" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
        }); 
        
        // Clear form and navigate
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          password: "",
        });
        setLoading(false);
        
        setTimeout(() => {
          navigate("/", { state: { mode: "signin", fromSignup: true } });
        }, 1500);
      } else {
        // Sign In
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

        // Clear form and navigate
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          password: "",
        });
        setLoading(false);
        
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err.message, {
        icon: <Icon name="warning" className="w-5 h-5 text-[#fbb034]" strokeWidth={2} />,
      });
      setLoading(false);
    }
  };

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${positionClasses} hidden md:flex`}>
      <h2 className="text-2xl font-medium text-white text-center flex items-center gap-2 justify-center">
        <Icon
          name={isSignup ? "clapper" : "popcorn"}
          className="w-6 h-6 text-white"
          strokeWidth={2}
        />
        <span>{title}</span>
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
            <div className="w-full">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#1a1520] px-3 py-3.5 text-white text-sm border border-red-900/20 select-none">
                  +964
                </span>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="780 996 1817"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  className="flex-1 rounded-lg border-0 bg-[#1a1520] px-3 py-3.5 text-white placeholder:text-[#8d889d] disabled:opacity-50"
                />
              </div>
            </div>
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
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded-lg border-0 bg-[#1a1520] px-3 py-3.5 pr-12 text-white placeholder:text-[#8d889d] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d889d] hover:text-white transition-colors"
            disabled={loading}
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              className="w-5 h-5"
              strokeWidth={2}
            />
          </button>
        </div>
        
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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }

    // Get current user
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    toast.info("👋 Logged out successfully. See you next time!");
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white relative overflow-hidden">
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

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-[#0d0a12]/80 backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-0.5"></div>
              </div>
              <h1 className="text-xl font-bold bg-linear-to-r from-[#c41e3a] via-[#d4145a] to-[#fbb034] bg-clip-text text-transparent">
                Watch Party
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-full bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-5xl">🎬</span>
            <h2 className="text-4xl md:text-5xl font-bold">Welcome Back, {user.username}!</h2>
            <span className="text-5xl">🍿</span>
          </div>
          <p className="text-xl text-white/75 max-w-2xl mx-auto">
            Host amazing watch parties with your friends. Stream together, chat together, enjoy together.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)]">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold mb-2">Create Party</h3>
            <p className="text-white/70">
              Start a new watch party and invite your friends to join the fun.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)]">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-white/70">
              Chat with your friends in real-time while watching together.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)]">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-2">Sync Playback</h3>
            <p className="text-white/70">
              Everyone stays in sync. Pause, play, and rewind together.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] rounded-2xl p-8 md:p-12 text-center shadow-[0_0_50px_rgba(196,30,58,0.4)]">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Watching?</h3>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Create your first watch party now and experience movies and shows like never before!
          </p>
          <button className="px-8 py-3 bg-white text-[#c41e3a] rounded-full font-semibold hover:bg-white/90 transition-all shadow-lg">
            Create Watch Party
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 border-t border-red-900/20 bg-[#0d0a12]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-white/50 text-sm">
            © 2026 Watch Party. Made with ❤️ for movie lovers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
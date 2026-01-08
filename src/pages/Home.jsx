import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";
import apiClient from "../config/api";
import userService from "../services/userService";
import partyService from "../services/partyService";
import Icon from "../components/Icon";

// Create Party Modal Component
const CreatePartyModal = ({ isOpen, onClose, onCreateSuccess }) => {
  const [partyName, setPartyName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partyName.trim()) {
      toast.error("❌ Party name is required!");
      return;
    }

    setLoading(true);
    try {
      const result = await partyService.createParty(partyName, thumbnail);
      toast.success("🎬 Party created successfully!");
      onCreateSuccess(result);
      onClose();
      setPartyName("");
      setThumbnail(null);
      setThumbnailPreview(null);
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md bg-[#0d0a12] border border-red-900/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(196,30,58,0.4)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#c41e3a] via-[#d4145a] to-[#fbb034] bg-clip-text text-transparent">
          Create Watch Party 🎬
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Party Name
            </label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Enter party name..."
              className="w-full rounded-lg border-0 bg-[#1a1520] px-4 py-3 text-white placeholder:text-[#8d889d]"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Cover Image <span className="text-white/50">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
                disabled={loading}
              />
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-red-900/30 rounded-lg cursor-pointer hover:border-red-500/50 transition-all"
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl mb-2">🖼️</span>
                    <p className="text-sm text-white/50">Click to upload cover image</p>
                    <p className="text-xs text-white/30 mt-1">JPG, PNG or WebP</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-full bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Party"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoDurations, setVideoDurations] = useState({});
  const [pagination, setPagination] = useState({
    size: 6,
    number: 0,
    totalElements: 0,
    totalPages: 1,
  });

  // Party states
  const [parties, setParties] = useState([]);
  const [partiesLoading, setPartiesLoading] = useState(false);
  const [partyPage, setPartyPage] = useState(0);
  const [partyTotalPages, setPartyTotalPages] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.refreshParties && user) {
      loadParties(0); 
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.refreshParties, user]);

  const normalizeUser = (data) => ({
    id: data?.id || data?.userId || data?.sub,
    name: data?.fullName || data?.name,
    email: data?.email,
    phoneNumber: data?.phoneNumber,
    profilePictureUrl:
      data?.profilePictureUrl || data?.profilePicture || data?.avatarUrl,
  });

  const fetchCurrentUser = async (userId) => {
    try {
      const apiUser = await userService.getProfile(userId);
      const normalizedUser = normalizeUser(apiUser);
      setUser(normalizedUser);
      setProfile(normalizedUser);
      localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    } catch (error) {
      console.error("Error fetching current user:", error);
      toast.error(error?.message || "Session expired. Please login again.");
      authService.logout();
      navigate("/");
    }
  };

  useEffect(() => {
    console.log("Home component mounted - checking authentication");

    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("currentUser");

    console.log("Token from localStorage:", token ? "Found" : "Not found");
    console.log("User from localStorage:", userStr ? "Found" : "Not found");

    if (!token) {
      console.log("User not authenticated, redirecting to login...");
      navigate("/");
      return;
    }

    try {
      if (userStr) {
        const cachedUser = JSON.parse(userStr);
        setUser(cachedUser);
        setProfile(cachedUser);
        if (cachedUser?.id) {
          fetchCurrentUser(cachedUser.id);
          return;
        }
      }
    } catch (error) {
      console.error("Error parsing user:", error);
    }

    console.log("Missing cached user id, redirecting to login");
    authService.logout();
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const fetchVideos = async (pageNumber = 0) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/api/v1/videos", {
          params: {
            page: pageNumber,
            size: 6,
            sortBy: "timestamp",
          },
        });
        console.log("Videos fetched successfully:", response.data);
        if (response.data && response.data.content) {
          setVideos(response.data.content);
          if (response.data.page) {
            setPagination(response.data.page);
          }
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
        toast.error("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVideos(pagination.number);
      loadParties(); // Load parties when user is available
    }
  }, [user]);

  // Load parties function
  const loadParties = async (page = 0) => {
    setPartiesLoading(true);
    try {
      const result = await partyService.getParties(page, 6, 'createdAt');
      setParties(result.content || []);
      setPartyTotalPages(result.page?.totalPages || 0);
      setPartyPage(page);
      
      if (page === 0 && location.state?.refreshParties) {
        toast.success("🔄 Parties list updated!");
      }
    } catch (error) {
      toast.error(`❌ Failed to load parties: ${error.message}`);
    } finally {
      setPartiesLoading(false);
    }
  };

  const handleJoinParty = async (partyId) => {
    try {
      await partyService.joinParty(partyId);
      toast.success("🍿 Joined party successfully!");
      navigate(`/party/${partyId}`);
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  const handleNextPage = () => {
    if (pagination.number < pagination.totalPages - 1) {
      fetchVideos(pagination.number + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.number > 0) {
      fetchVideos(pagination.number - 1);
    }
  };

  const handleWatchVideo = (video) => {
    navigate("/watch", { state: { video } });
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoLoadedMetadata = (videoUrl, e) => {
    setVideoDurations((prev) => ({
      ...prev,
      [videoUrl]: e.target.duration,
    }));
  };

  const fetchVideos = async (pageNumber = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/v1/videos", {
        params: {
          page: pageNumber,
          size: 6,
          sortBy: "timestamp",
        },
      });
      console.log("Videos fetched successfully:", response.data);
      if (response.data && response.data.content) {
        setVideos(response.data.content);
        if (response.data.page) {
          setPagination(response.data.page);
        }
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again later.");
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.info("Logged out successfully. See you next time!", {
      icon: <Icon name="wave" className="w-5 h-5" strokeWidth={2} />,
    });
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 text-white">
            <Icon name="clapper" className="w-10 h-10" strokeWidth={2} />
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white relative overflow-hidden">
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
            <Icon
              name="popcorn"
              className="w-10 h-10 text-white"
              strokeWidth={2}
            />
          </div>
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-[#0d0a12]/80 backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-0.5"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#c41e3a] via-[#d4145a] to-[#fbb034] bg-clip-text text-transparent">
                Watch Party
              </h1>
            </div>

            {/* Profile Card */}
            <div
              className="flex items-center gap-3 rounded-full px-3 py-2 transition-all bg-[#0d0a12] border border-red-900/20 hover:border-red-500/40 hover:bg-red-900/10 cursor-pointer"
              onClick={() => navigate("/profile")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/profile");
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[#1a1520] flex items-center justify-center flex-shrink-0 overflow-hidden border border-red-900/30">
                {profile?.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {(profile?.name || user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col min-w-0 text-left">
                <span className="text-sm font-semibold text-white truncate">
                  {profile?.name || user?.name}
                </span>
                <span className="text-xs text-white/50 truncate">
                  {profile?.email || user?.email}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="ml-2 px-4 py-1.5 text-sm rounded-full bg-red-900/40 hover:bg-red-900/60 text-white transition-all border border-red-900/20"
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
          <div className="inline-flex items-center gap-3 mb-4 flex-wrap justify-center">
            <Icon
              name="clapper"
              className="w-12 h-12 text-white"
              strokeWidth={2}
            />
            <h2 className="text-4xl md:text-5xl font-bold">
              Welcome Back, {profile?.name || user?.name}!
            </h2>
            <Icon
              name="popcorn"
              className="w-12 h-12 text-white"
              strokeWidth={2}
            />
          </div>
          <p className="text-xl text-white/75 max-w-2xl mx-auto">
            Host amazing watch parties with your friends. Stream together, chat
            together, enjoy together.
          </p>
          {profile && (
            <div className="mt-4 text-sm text-white/50">
              <p>{profile.email}</p>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div 
            className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)] cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="text-4xl mb-4 text-white">
              <Icon name="clapper" className="w-10 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Party</h3>
            <p className="text-white/70">
              Start a new watch party and invite your friends to join the fun.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)]">
            <div className="text-4xl mb-4 text-white">
              <Icon name="chat" className="w-10 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-white/70">
              Chat with your friends in real-time while watching together.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)]">
            <div className="text-4xl mb-4 text-white">
              <Icon name="drama" className="w-10 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sync Playback</h3>
            <p className="text-white/70">
              Everyone stays in sync. Pause, play, and rewind together.
            </p>
          </div>
        </div>

        {/* Active Parties Section - NEW! */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Active Watch Parties 🎬</h2>
              <p className="text-white/70">Join a party or create your own!</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              + Create Party
            </button>
          </div>

          {partiesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              <p className="mt-4 text-white/70">Loading parties...</p>
            </div>
          ) : parties.length === 0 ? (
            <div className="text-center py-12 bg-[#0d0a12] border border-red-900/20 rounded-2xl">
              <span className="text-6xl mb-4">🎭</span>
              <p className="text-xl text-white/70">No active parties yet. Be the first to create one!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parties.map((party) => (
                  <div
                    key={party.id}
                    className="bg-[#0d0a12] border border-red-900/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)] group cursor-pointer"
                    onClick={() => handleJoinParty(party.id)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={party.thumbnailUrl}
                        alt={party.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {!party.isPrivate && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/80 rounded-full text-xs font-semibold">
                          Public
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 truncate">{party.name}</h3>
                      <div className="flex items-center justify-between text-sm text-white/50">
                        <span className="truncate">Host: {party.ownerName || `User ${party.ownerUserId}`}</span>
                        <span className="text-xs flex-shrink-0 ml-2">{new Date(party.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Party Pagination */}
              {partyTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => loadParties(Math.max(0, partyPage - 1))}
                    disabled={partyPage === 0}
                    className="px-4 py-2 rounded-lg bg-[#0d0a12] border border-red-900/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {partyPage + 1} of {partyTotalPages}
                  </span>
                  <button
                    onClick={() => loadParties(Math.min(partyTotalPages - 1, partyPage + 1))}
                    disabled={partyPage >= partyTotalPages - 1}
                    className="px-4 py-2 rounded-lg bg-[#0d0a12] border border-red-900/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Videos Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Available Videos</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-4xl mb-4 text-white">
                  <Icon name="clapper" className="w-10 h-10" strokeWidth={2} />
                </div>
                <p className="text-white/70">Loading videos...</p>
              </div>
            </div>
          ) : videos && videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {videos.map((video) => (
                  <div
                    key={video.videoUrl}
                    onClick={() => handleWatchVideo(video)}
                    className="bg-[#0d0a12] border border-red-900/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all hover:shadow-[0_0_30px_rgba(196,30,58,0.3)] cursor-pointer group"
                  >
                    <div className="relative overflow-hidden bg-[#1a1520] aspect-video flex items-center justify-center group">
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.target.currentTime = 1;
                          handleVideoLoadedMetadata(video.videoUrl, e);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <svg
                          className="w-20 h-20 opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-lg text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <polygon points="5 3 19 12 5 21" />
                        </svg>
                      </div>
                      {videoDurations[video.videoUrl] && (
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-sm font-semibold text-white">
                          {formatDuration(videoDurations[video.videoUrl])}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {video.videoName}
                      </h3>
                      <p className="text-white/70 text-sm mb-1">
                        <span className="text-white/50">By:</span>{" "}
                        {video.ownerFullName}
                      </p>
                      <div className="flex flex-col gap-2 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Icon
                            name="calendar"
                            className="w-4 h-4"
                            strokeWidth={2}
                          />
                          {new Date(video.timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon
                            name="clock"
                            className="w-4 h-4"
                            strokeWidth={2}
                          />
                          {new Date(video.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.number === 0}
                  className="px-6 py-2 bg-red-900/40 hover:bg-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed border border-red-900/20 rounded-lg transition-all text-white"
                >
                  ← Previous
                </button>
                <div className="text-white/70 text-sm">
                  Page {pagination.number + 1} of {pagination.totalPages} (
                  {pagination.totalElements} total videos)
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.number >= pagination.totalPages - 1}
                  className="px-6 py-2 bg-red-900/40 hover:bg-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed border border-red-900/20 rounded-lg transition-all text-white"
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">No videos available yet</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] rounded-2xl p-8 md:p-12 text-center shadow-[0_0_50px_rgba(196,30,58,0.4)]">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Watching?</h3>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Create your first watch party now and experience movies and shows
            like never before!
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="px-8 py-3 bg-white text-[#c41e3a] rounded-full font-semibold hover:bg-white/90 transition-all shadow-lg"
          >
            Upload Video
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 border-t border-red-900/20 bg-[#0d0a12]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-white/50 text-sm">
            © 2026 Watch Party. Made with
            <span className="inline-flex items-center align-middle px-1">
              <Icon
                name="heart"
                className="w-4 h-4 text-red-400"
                strokeWidth={2}
              />
            </span>
            for movie lovers.
          </p>
        </div>
      </footer>

      {/* Create Party Modal */}
      <CreatePartyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={(result) => {
          if (result?.data?.id) {
            handleJoinParty(result.data.id);
          }
        }}
      />
    </div>
  );
};

export default Home;
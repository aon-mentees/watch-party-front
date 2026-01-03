import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../config/api";
import Icon from "../Icon";

const VideoPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const videoData = location.state?.video;

  useEffect(() => {
    if (!videoData) {
      toast.error("No video selected");
      navigate("/home");
      return;
    }
    setVideo(videoData);
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing current user:", error);
      }
    }
  }, [videoData, navigate]);

  useEffect(() => {
    if (!video || !currentUser) {
      setIsOwner(false);
      return;
    }

    // Simple ownership check: compare userId
    const isVideoOwner = video.userId && currentUser.id && Number(video.userId) === Number(currentUser.id);
    setIsOwner(isVideoOwner);
  }, [video, currentUser]);

  const handleDeleteVideo = async () => {
    if (!isOwner) {
      toast.error("You can only delete your own videos");
      return;
    }

    setDeleting(true);
    try {
      // Extract filename from videoUrl
      const filename = video.videoUrl.split('/').pop();
      await apiClient.delete(`/api/v1/videos/${filename}`);
      console.log("Video deleted successfully");
      toast.success("Video deleted successfully!", {
        icon: <Icon name="trash" className="w-5 h-5" strokeWidth={2} />,
      });
      
      // Redirect back to home after deletion
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      console.error("Error deleting video:", err);
      toast.error(err.response?.data?.message || "Failed to delete video");
      setDeleting(false);
    }
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] flex items-center justify-center">
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
    <div className="min-h-screen bg-linear-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white relative overflow-hidden">
      {/* Navigation Bar */}
      <nav className="relative z-10 bg-[#0d0a12]/80 backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
            >
              <span>← Back</span>
            </button>
            <h1 className="text-xl font-bold bg-linear-to-r from-[#c41e3a] via-[#d4145a] to-[#fbb034] bg-clip-text text-transparent">
              Watch Party
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Video Player */}
        <div className="mb-8">
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(196,30,58,0.3)]">
            <video
              controls
              autoPlay
              className="w-full h-auto"
              style={{ maxHeight: "600px" }}
            >
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Video Information */}
        <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-4">{video.videoName}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-white/70 mb-2">
                <span className="text-white/50">Uploaded by:</span> {video.ownerFullName}
              </p>
              <p className="text-white/70">
                <span className="text-white/50">Uploaded on:</span> {new Date(video.timestamp).toLocaleDateString()} at{" "}
                {new Date(video.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Back to Videos
            </button>
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg font-semibold flex items-center gap-2"
              >
                <Icon name="trash" className="w-5 h-5" strokeWidth={2} />
                <span>{deleting ? "Deleting..." : "Delete Video"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
            <div className="text-4xl mb-4 text-white">
              <Icon name="chat" className="w-10 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-white/70 text-sm">
              Chat with friends watching the same video in real-time.
            </p>
          </div>
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
            <div className="text-4xl mb-4 text-white">
              <Icon name="drama" className="w-10 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sync Playback</h3>
            <p className="text-white/70 text-sm">
              Everyone's player stays synchronized automatically.
            </p>
          </div>
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
            <div className="text-4xl mb-4 text-white">
              <Icon name="users" className="w-10 h-10" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
            <p className="text-white/70 text-sm">
              Share the party link with friends to watch together.
            </p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && isOwner && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 text-yellow-400 flex justify-center">
                  <Icon name="warning" className="w-14 h-14" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Delete Video?</h2>
                <p className="text-white/70 mb-4">
                  Are you sure you want to delete this video? This action cannot be undone.
                </p>
                <p className="text-white/50 text-sm">
                  <span className="font-semibold">{video.videoName}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-[#1a1520] text-white border border-red-900/20 rounded-lg hover:bg-[#2a1f2e] disabled:opacity-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 border-t border-red-900/20 bg-[#0d0a12]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-white/50 text-sm">
            © 2026 Watch Party. Made with
            <span className="inline-flex items-center align-middle px-1">
              <Icon name="heart" className="w-4 h-4 text-red-400" strokeWidth={2} />
            </span>
            for movie lovers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VideoPlayer;

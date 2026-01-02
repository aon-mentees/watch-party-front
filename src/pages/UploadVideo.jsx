import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../config/api";

const UploadVideo = () => {
  const navigate = useNavigate();
  const [videoName, setVideoName] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      if (file.size > 1024 * 1024 * 500) {
        // 500MB limit
        toast.error("File size must be less than 500MB");
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoName.trim()) {
      toast.error("Please enter a video name");
      return;
    }

    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("videoName", videoName);
      formData.append("multipartFile", videoFile);

      const response = await apiClient.post("/api/v1/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Video uploaded successfully:", response.data);
      toast.success("🎉 Video uploaded successfully!");
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error(error.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

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
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-5xl">🎬</span>
            <h2 className="text-4xl font-bold">Upload Video</h2>
          </div>
          <p className="text-xl text-white/75">
            Share your favorite videos with your friends
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Name Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Video Name
              </label>
              <input
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter video name..."
                disabled={loading}
                className="w-full px-4 py-3 bg-[#1a1520] border border-red-900/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-500/50 transition-colors disabled:opacity-50"
              />
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Select Video File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                  id="video-input"
                />
                <label
                  htmlFor="video-input"
                  className="block w-full px-4 py-3 bg-[#1a1520] border-2 border-dashed border-red-900/40 rounded-lg text-white text-center cursor-pointer hover:border-red-500/60 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📹</span>
                    <span>
                      {videoFile
                        ? videoFile.name
                        : "Click to select or drag & drop"}
                    </span>
                    {videoFile && (
                      <span className="text-xs text-white/50">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </label>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Supported formats: MP4, WebM, Ogg. Max size: 500MB
              </p>
            </div>

            {/* Progress Bar */}
            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Uploading...</span>
                  <span className="text-sm text-white/70">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#1a1520] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-[#c41e3a] via-[#d4145a] to-[#fbb034] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !videoName.trim() || !videoFile}
              className="w-full px-6 py-3 bg-linear-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>📤</span>
                  Upload Video
                </span>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate("/home")}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#1a1520] text-white border border-red-900/20 rounded-lg font-semibold hover:bg-[#2a1f2e] disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
            <p className="text-white/70">
              Upload your videos in seconds and start sharing with friends.
            </p>
          </div>
          <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-white/70">
              Your videos are securely stored and only accessible to you and your friends.
            </p>
          </div>
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

export default UploadVideo;

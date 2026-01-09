import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";
import partyService from "../services/partyService";
import userService from "../services/userService";
import apiClient from "../config/api";
import websocketService from "../services/websocketService";

const PartyRoom = () => {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [party, setParty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [ownerVideos, setOwnerVideos] = useState([]);
  const [ownerVideosLoading, setOwnerVideosLoading] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [isLeavingParty, setIsLeavingParty] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  
  // Track if we should ignore video events (to prevent loops)
  const ignoringEvents = useRef(false);
  const lastSyncTime = useRef(0);
  const userInitiated = useRef(false);
  const lastPermissionWarningTime = useRef(0);

  useEffect(() => {
    if (!userScrolledUp && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolledUp]);

  const handleMessagesScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setUserScrolledUp(!isAtBottom);
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    loadPartyData(currentUser);
    connectWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [partyId, navigate]);

  // Ensure owner videos are fetched if user info arrives slightly later
  useEffect(() => {
    if (user && party && user.id === party.ownerUserId) {
      fetchOwnerVideos();
    }
  }, [user, party]);

  const loadPartyData = async (currentUserParam) => {
    try {
      const partyDetails = await partyService.getPartyDetails(partyId);
      
      if (partyDetails.data.members && partyDetails.data.members.length > 0) {
        try {
          const membersWithProfilePics = await Promise.all(
            partyDetails.data.members.map(async (member) => {
              try {
                const userDetails = await userService.getProfile(member.userId);
                return {
                  ...member,
                  profilePictureUrl: userDetails?.profilePictureUrl || userDetails?.profilePicture || member.profilePictureUrl
                };
              } catch (err) {
                console.error(`Failed to fetch profile for ${member.userId}:`, err);
                return member;
              }
            })
          );
          partyDetails.data.members = membersWithProfilePics;
        } catch (err) {
          console.error('Error fetching member profiles:', err);
        }
      }
      
      setParty(partyDetails.data);
      
      // Load available videos for owner selection
      const effectiveUser = currentUserParam || user;
      if (effectiveUser?.id === partyDetails.data.ownerUserId) {
        fetchOwnerVideos();
      }
      
      if (partyDetails.data.currentVideoUrl) {
        setVideoUrl(partyDetails.data.currentVideoUrl);
      }

      const messagesData = await partyService.getPartyMessages(partyId, 0, 50);
      setMessages(messagesData.data.content.reverse() || []);

      if (partyDetails.data.latestSyncEventPayload) {
        try {
          const syncEvent = JSON.parse(partyDetails.data.latestSyncEventPayload);
          if (syncEvent.videoUrl) {
            handleFirstEvent(syncEvent);
          }
        } catch (e) {
          console.error('Error parsing latestSyncEventPayload:', e);
        }
      }
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const token = authService.getToken();
    
    websocketService.connect(
      token,
      () => {
        setWsConnected(true);
        toast.success("🔌 Connected to party!");

        // Subscribe to chat
        websocketService.subscribeToChat(partyId, (message) => {
          setMessages(prev => [...prev, message]);
        });

        // Subscribe to sync events
        websocketService.subscribeToSyncEvents(partyId, (event) => {
          handleSyncEvent(event);
        });

        // Subscribe to member events
        websocketService.subscribeToMemberEvents((event) => {
          if (event.event === 'JOINED') {
            toast.info(`👋 User ${event.userId} joined the party!`);
            loadPartyData(); // Refresh party details
          } else if (event.event === 'LEFT') {
            toast.info(`👋 User ${event.userId} left the party`);
            loadPartyData();
          }
        });

        // Subscribe to errors
        websocketService.subscribeToErrors((error) => {
          toast.error(`❌ ${error}`);
        });
      },
      (error) => {
        setWsConnected(false);
        toast.error("❌ WebSocket connection failed!");
      }
    );
  };

const handleFirstEvent = (syncEvent) => {
  if (!videoRef.current) return;

  const videoCurrentTime = syncEvent.videoCurrentTime || 0;
  const eventDateTime = syncEvent.eventDateTime || Date.now();
  const videoUrl = syncEvent.videoUrl;
  
  // Calculate time offset (how long ago the event happened)
  const myTime = Date.now();
  const offset = (myTime - eventDateTime) / 1000; // Convert to seconds

  ignoringEvents.current = true;
  
  // Set video URL
  setVideoUrl(videoUrl);
  videoRef.current.src = videoUrl;
  videoRef.current.load();

  // Wait for video to load, then sync
  videoRef.current.onloadeddata = () => {
    switch (syncEvent.event) {
      case 'PLAY':
        // If video is playing, sync to current time + offset
        videoRef.current.currentTime = videoCurrentTime + offset;
        videoRef.current.play().catch(console.error);
        toast.info("🎬 Synced to current video position");
        break;
      
      case 'PAUSE':
        // If video is paused, sync to exact time
        videoRef.current.currentTime = videoCurrentTime;
        videoRef.current.pause();
        toast.info("⏸️ Video is paused");
        break;
      
      case 'SEEK':
        // Sync to seek position
        videoRef.current.currentTime = videoCurrentTime;
        if (syncEvent.previousEvent === 'PLAY') {
          videoRef.current.currentTime = videoCurrentTime + offset;
          videoRef.current.play().catch(console.error);
        }
        break;
    }

    setTimeout(() => {
      ignoringEvents.current = false;
    }, 1500);
  };
};

  const handleSyncEvent = (event) => {
    if (!videoRef.current) return;

    ignoringEvents.current = true;
    lastSyncTime.current = Date.now();
    userInitiated.current = false;
    
    try {
      switch (event.event) {
        case 'PLAY':
          const playTime = event.videoCurrentTime || 0;
          if (Math.abs(videoRef.current.currentTime - playTime) > 0.5) {
            videoRef.current.currentTime = playTime;
          }
          if (videoRef.current.paused) {
            videoRef.current.play().catch(console.error);
          }
          break;
        
        case 'PAUSE':
          const pauseTime = event.videoCurrentTime || 0;
          if (Math.abs(videoRef.current.currentTime - pauseTime) > 0.5) {
            videoRef.current.currentTime = pauseTime;
          }
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
          break;
        
        case 'SEEK':
          videoRef.current.currentTime = event.videoCurrentTime || 0;
          break;
        
        case 'CHANGE_VIDEO':
        case 'CHANGE_URL':
          setVideoUrl(event.videoUrl);
          break;
      }
    } catch (error) {
      console.error('Sync event error:', error);
    }

    setTimeout(() => {
      ignoringEvents.current = false;
      userInitiated.current = false;
    }, 1500);
  };

  const handleVideoPlay = () => {
    if (!wsConnected || ignoringEvents.current || Date.now() - lastSyncTime.current < 1500) return;
    
    if (user?.id !== party?.ownerUserId) {
      videoRef.current?.pause();
      return;
    }
    
    userInitiated.current = true;
    websocketService.sendSyncEvent(
      partyId,
      'PLAY',
      videoUrl,
      videoRef.current?.currentTime || 0
    );
  };

  const handleVideoPause = () => {
    if (!wsConnected || ignoringEvents.current || Date.now() - lastSyncTime.current < 1500 || isLeavingParty) return;
    
    if (user?.id !== party?.ownerUserId) {
      videoRef.current?.play();
      return;
    }
    
    userInitiated.current = true;
    websocketService.sendSyncEvent(
      partyId,
      'PAUSE',
      videoUrl,
      videoRef.current?.currentTime || 0
    );
  };

  const handleVideoSeeking = () => {
    if (!wsConnected || ignoringEvents.current || Date.now() - lastSyncTime.current < 1500) return;
    
    if (user?.id !== party?.ownerUserId) {
      return;
    }
    
    websocketService.sendSyncEvent(
      partyId,
      'SEEK',
      videoUrl,
      videoRef.current?.currentTime || 0
    );
  };

  const fetchOwnerVideos = async () => {
    setOwnerVideosLoading(true);
    try {
      const response = await apiClient.get("/api/v1/videos", {
        params: { page: 0, size: 20, sortBy: "timestamp" },
      });
      setOwnerVideos(response.data?.content || []);
    } catch (err) {
      console.error("Error fetching owner videos:", err);
    } finally {
      setOwnerVideosLoading(false);
    }
  };

  const sendVideoChange = (url) => {
    setVideoUrl(url);
    websocketService.sendSyncEvent(partyId, 'CHANGE_URL', url, 0);
    toast.success("🎬 Video changed!");
  };

  const handleLoadSelectedVideo = (e) => {
    e.preventDefault();
    if (!selectedVideoUrl) {
      toast.error("❌ Please select a video!");
      return;
    }
    if (!wsConnected) {
      toast.error("❌ WebSocket not connected");
      return;
    }
    sendVideoChange(selectedVideoUrl);
  };

  const handleChangeVideo = (e) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) {
      toast.error("❌ Please enter a video URL!");
      return;
    }

    if (!wsConnected) {
      toast.error("❌ WebSocket not connected");
      return;
    }

    sendVideoChange(newVideoUrl);
    setNewVideoUrl("");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsConnected) return;

    websocketService.sendChatMessage(partyId, newMessage);
    setNewMessage("");
  };

  const handleLeaveParty = async () => {
    setIsLeavingParty(true);
    try {
      await partyService.leaveParty();
      websocketService.disconnect();
      toast.info("👋 Left the party");
      navigate("/home", { replace: true });
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  if (loading || !party) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <p className="mt-4 text-white/70">Loading party room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c15] via-[#1a1520] to-[#0f0c15] text-white">
      {/* Header */}
      <nav className="bg-[#0d0a12]/80 backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{party.partyName} 🎬</h1>
              <p className="text-sm text-white/50">Host: {party.ownerName}</p>
              {user?.id === party?.ownerUserId ? (
                <p className="text-xs text-yellow-400 mt-1">👑 You are the host - you control video playback</p>
              ) : (
                <p className="text-xs text-white/50 mt-1">🔒 Only the host can control video playback</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{wsConnected ? 'Connected' : 'Disconnected'}</span>
              <button
                onClick={handleLeaveParty}
                className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-all"
              >
                Leave Party
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl overflow-hidden relative">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls={user?.id === party?.ownerUserId}
                    className="w-full aspect-video bg-black"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onSeeking={handleVideoSeeking}
                  />
                  {/* Fullscreen button for non-owners */}
                  {user?.id !== party?.ownerUserId && (
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (videoRef.current.requestFullscreen) {
                            videoRef.current.requestFullscreen();
                          } else if (videoRef.current.webkitRequestFullscreen) {
                            videoRef.current.webkitRequestFullscreen();
                          } else if (videoRef.current.msRequestFullscreen) {
                            videoRef.current.msRequestFullscreen();
                          }
                        }
                      }}
                      className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg flex items-center gap-2 transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full aspect-video bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4">📺</span>
                    <p className="text-white/50">No video loaded yet</p>
                    <p className="text-sm text-white/30 mt-2">Add a video URL below to start watching</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-4 flex flex-col h-116">
              {/* Tab Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("members")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === "members"
                      ? "bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white"
                      : "bg-[#1a1520] text-white/70 hover:text-white"
                  }`}
                >
                  👥 Members ({party.members?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === "chat"
                      ? "bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] text-white"
                      : "bg-[#1a1520] text-white/70 hover:text-white"
                  }`}
                >
                  💬 Chat
                </button>
              </div>

              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {party.members?.map((member) => (
                    <div key={member.userId} className="flex items-center gap-2 p-2 bg-[#1a1520] rounded-lg">
                      {member.profilePictureUrl ? (
                        <img
                          src={member.profilePictureUrl}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!member.profilePictureUrl && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#fbb034] flex items-center justify-center text-sm font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        {member.userId === party.ownerUserId && (
                          <span className="text-xs text-yellow-400">👑 Host</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === "chat" && (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                    className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2"
                  >
                    {messages.length === 0 ? (
                      <p className="text-center text-white/50 text-sm">No messages yet. Say hi! 👋</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="p-2 bg-[#1a1520] rounded-lg">
                          <p className="text-xs text-white/50 mb-1">
                            {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send Message */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border-0 bg-[#1a1520] px-3 py-2 text-sm text-white placeholder:text-[#8d889d]"
                      disabled={!wsConnected}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!wsConnected}
                      className="px-4 py-2 rounded-lg bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Video URL - Only visible to owner - Full Width */}
        {user?.id === party?.ownerUserId && (
          <div className="mt-6 bg-[#0d0a12] border border-red-900/20 rounded-2xl p-4 space-y-4">
            
            <h3 className="text-lg font-semibold mb-3">Change Video 🎥</h3>

              {/* Manual URL Input */}
            <div className="pt-2 border-t border-red-900/20">
              <label className="text-sm text-white/70 block mb-2">Paste a video URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Paste video URL here..."
                  className="flex-1 rounded-lg border-0 bg-[#1a1520] px-4 py-2 text-white placeholder:text-[#8d889d]"
                />
                <button
                  onClick={handleChangeVideo}
                  className="px-6 py-2 rounded-lg bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] hover:opacity-90 transition-opacity"
                >
                  Load Video
                </button>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Supported: Direct video links (.mp4, .webm) or streaming URLs
              </p>
            </div>
            {/* Your Videos Grid */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 block">Or Choose from your uploads</label>
              {ownerVideosLoading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    <p className="text-white/50 mt-2 text-sm">Loading videos...</p>
                  </div>
                </div>
              ) : ownerVideos.length === 0 ? (
                <div className="text-center py-8 bg-[#1a1520] rounded-lg border border-red-900/10">
                  <p className="text-white/50 text-sm">No videos uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto">
                  {ownerVideos.map((video) => (
                    <div
                      key={video.videoUrl}
                      onClick={() => setSelectedVideoUrl(video.videoUrl)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVideoUrl === video.videoUrl
                          ? 'border-red-500 shadow-[0_0_15px_rgba(196,30,58,0.5)]'
                          : 'border-red-900/20 hover:border-red-500/40'
                      }`}
                    >
                      <div className="relative bg-black/50 aspect-video flex items-center justify-center">
                        <video
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          onLoadedMetadata={(e) => (e.target.currentTime = 1)}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <svg className="w-6 h-6 opacity-70 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21" />
                          </svg>
                        </div>
                      </div>
                      <div className="bg-[#1a1520] p-2">
                        <p className="text-xs font-semibold truncate text-white">{video.videoName}</p>
                        <p className="text-xs text-white/50 truncate">{video.ownerFullName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedVideoUrl && (
                <button
                  onClick={handleLoadSelectedVideo}
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[#c41e3a] via-[#d4145a] to-[#fbb034] hover:opacity-90 transition-opacity text-white font-semibold"
                >
                  Load Selected Video
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyRoom;
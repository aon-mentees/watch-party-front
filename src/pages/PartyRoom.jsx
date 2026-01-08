import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";
import partyService from "../services/partyService";
import websocketService from "../services/websocketService";

const PartyRoom = () => {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [party, setParty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Track if we should ignore video events (to prevent loops)
  const ignoringEvents = useRef(false);
  const lastSyncTime = useRef(0);
  const userInitiated = useRef(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/");
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    loadPartyData();
    connectWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [partyId, navigate]);

  const loadPartyData = async () => {
    try {
      const partyDetails = await partyService.getPartyDetails(partyId);
      setParty(partyDetails.data);
      
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
          toast.info(`▶️ ${event.userName} played the video`);
          break;
        
        case 'PAUSE':
          const pauseTime = event.videoCurrentTime || 0;
          if (Math.abs(videoRef.current.currentTime - pauseTime) > 0.5) {
            videoRef.current.currentTime = pauseTime;
          }
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
          toast.info(`⏸️ ${event.userName} paused the video`);
          break;
        
        case 'SEEK':
          videoRef.current.currentTime = event.videoCurrentTime || 0;
          toast.info(`⏩ ${event.userName} seeked the video`);
          break;
        
        case 'CHANGE_VIDEO':
        case 'CHANGE_URL':
          setVideoUrl(event.videoUrl);
          toast.info(`🎬 ${event.userName} changed the video`);
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
    
    userInitiated.current = true;
    websocketService.sendSyncEvent(
      partyId,
      'PLAY',
      videoUrl,
      videoRef.current?.currentTime || 0
    );
  };

  const handleVideoPause = () => {
    if (!wsConnected || ignoringEvents.current || Date.now() - lastSyncTime.current < 1500) return;
    
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
    
    websocketService.sendSyncEvent(
      partyId,
      'SEEK',
      videoUrl,
      videoRef.current?.currentTime || 0
    );
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

    setVideoUrl(newVideoUrl);
    websocketService.sendSyncEvent(partyId, 'CHANGE_URL', newVideoUrl, 0);
    setNewVideoUrl("");
    toast.success("🎬 Video changed!");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsConnected) return;

    websocketService.sendChatMessage(partyId, newMessage);
    setNewMessage("");
  };

  const handleLeaveParty = async () => {
    try {
      await partyService.leaveParty();
      websocketService.disconnect();
      toast.info("👋 Left the party");
      navigate("/home");
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
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl overflow-hidden">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full aspect-video bg-black"
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onSeeking={handleVideoSeeking}
                />
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

            {/* Change Video URL */}
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-4">
              <h3 className="text-lg font-semibold mb-3">Change Video 🎥</h3>
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
              <p className="text-xs text-white/40 mt-2">
                Supported: Direct video links (.mp4, .webm) or streaming URLs
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Members List */}
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-4">
              <h3 className="text-lg font-semibold mb-3">Members ({party.members?.length || 0}) 👥</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {party.members?.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2 p-2 bg-[#1a1520] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#fbb034] flex items-center justify-center text-sm font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.userId === party.ownerUserId && (
                        <span className="text-xs text-yellow-400">👑 Host</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-[#0d0a12] border border-red-900/20 rounded-2xl p-4 flex flex-col h-[500px]">
              <h3 className="text-lg font-semibold mb-3">Chat 💬</h3>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyRoom;
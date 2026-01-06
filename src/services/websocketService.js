import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
  }

  connect(token, onConnected, onError) {
    const API_URL = import.meta.env.VITE_API_URL;
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected!');
        this.connected = true;
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log('WebSocket Closed');
        this.connected = false;
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      Object.keys(this.subscriptions).forEach(key => {
        this.subscriptions[key].unsubscribe();
      });
      this.subscriptions = {};
      this.client.deactivate();
      this.connected = false;
    }
  }

  // Subscribe to party chat
  subscribeToChat(partyId, callback) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/chat.${partyId}`;
    const subscription = this.client.subscribe(destination, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });

    this.subscriptions[`chat-${partyId}`] = subscription;
    return subscription;
  }

  // Subscribe to sync events (play/pause/seek)
  subscribeToSyncEvents(partyId, callback) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/party.${partyId}`;
    const subscription = this.client.subscribe(destination, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });

    this.subscriptions[`sync-${partyId}`] = subscription;
    return subscription;
  }

  // Subscribe to member events (join/leave)
  subscribeToMemberEvents(callback) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = '/topic/member-events';
    const subscription = this.client.subscribe(destination, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });

    this.subscriptions['member-events'] = subscription;
    return subscription;
  }

  // Subscribe to errors
  subscribeToErrors(callback) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = '/user/queue/errors';
    const subscription = this.client.subscribe(destination, (message) => {
      const error = message.body;
      callback(error);
    });

    this.subscriptions['errors'] = subscription;
    return subscription;
  }

  // Send chat message
  sendChatMessage(partyId, content) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/watchParty-chats/${partyId}`,
      body: JSON.stringify({ content }),
    });
  }

  // Send sync event (play/pause/seek/changeVideo)
  sendSyncEvent(partyId, event, videoUrl, videoCurrentTime) {
    if (!this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/party/${partyId}`,
      body: JSON.stringify({
        event, // 'PLAY', 'PAUSE', 'SEEK', 'CHANGE_URL'
        videoUrl,
        videoCurrentTime,
        eventDateTime: Date.now(),
      }),
    });
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function normalizeBaseUrl(url) {
  if (!url) return "";
  return url.replace(/\/+$/, "");
}

function stripApiPath(url) {
  if (!url) return "";
  return url.replace(/\/api\/v\d+$/i, "").replace(/\/api\/v\d+\/.*$/i, "");
}

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = {};
  }

  connect(token, onConnected, onError) {
    const rawWsBase = import.meta.env.VITE_WS_URL;
    const rawApiBase = import.meta.env.VITE_API_URL;

    const wsBase =
      normalizeBaseUrl(rawWsBase) ||
      normalizeBaseUrl(stripApiPath(rawApiBase)) ||
      "";

    const wsEndpoint = wsBase ? `${wsBase}/ws` : "/ws";

    const sockJsUrl = `${wsEndpoint}?token=${encodeURIComponent(token)}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(sockJsUrl),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      debug: (str) => console.log("[STOMP]", str),

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("WebSocket Connected!");
        this.connected = true;
        onConnected?.();
      },

      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
        this.connected = false;
        onError?.(frame);
      },

      onWebSocketError: (evt) => {
        console.error("WebSocket Error:", evt);
        this.connected = false;
      },

      onWebSocketClose: (evt) => {
        console.log("WebSocket Closed", evt);
        this.connected = false;
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (!this.client) return;

    Object.values(this.subscriptions).forEach((sub) => sub?.unsubscribe?.());
    this.subscriptions = {};

    this.client.deactivate();
    this.connected = false;
  }

  subscribeToChat(partyId, callback) {
    if (!this.connected) return null;

    const destination = `/topic/chat.${partyId}`;
    const sub = this.client.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });

    this.subscriptions[`chat-${partyId}`] = sub;
    return sub;
  }

  subscribeToSyncEvents(partyId, callback) {
    if (!this.connected) return null;

    const destination = `/topic/party.${partyId}`;
    const sub = this.client.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });

    this.subscriptions[`sync-${partyId}`] = sub;
    return sub;
  }

  subscribeToMemberEvents(callback) {
    if (!this.connected) return null;

    const destination = `/topic/member-events`;
    const sub = this.client.subscribe(destination, (message) => {
      callback(JSON.parse(message.body));
    });

    this.subscriptions["member-events"] = sub;
    return sub;
  }

  subscribeToErrors(callback) {
    if (!this.connected) return null;

    const destination = `/user/queue/errors`;
    const sub = this.client.subscribe(destination, (message) => {
      callback(message.body);
    });

    this.subscriptions["errors"] = sub;
    return sub;
  }

  sendChatMessage(partyId, content) {
    if (!this.connected) return;

    this.client.publish({
      destination: `/app/watchParty-chats/${partyId}`,
      body: JSON.stringify({ content }),
    });
  }

  sendSyncEvent(partyId, event, videoUrl, videoCurrentTime) {
    if (!this.connected) return;

    this.client.publish({
      destination: `/app/party/${partyId}`,
      body: JSON.stringify({
        event,
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

export default new WebSocketService();

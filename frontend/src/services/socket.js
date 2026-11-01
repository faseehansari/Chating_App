
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.connect();

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

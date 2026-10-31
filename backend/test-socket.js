
import { io } from "socket.io-client";

const token = process.argv[2];

if (!token) {
  console.log("Please provide JWT token");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Socket Connected Successfully!");
  console.log("Socket ID:", socket.id);
  console.log("User is now online.");
});

socket.on("connect_error", (error) => {
  console.log("Connection Error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket Disconnected:", reason);
  console.log("User is now offline.");
});

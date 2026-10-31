
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/DB.js";

dotenv.config();

const app = express();

// HTTP Server
const server = http.createServer(app);

// Socket.IO will be initialized here later

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Application API is running!",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

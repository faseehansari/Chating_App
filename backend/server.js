
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/DB.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middelwear/authMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://chating-app-lilac.vercel.app",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS before all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// Body Parser
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Application API is running!",
  });
});

// Protected Test Route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated!",
    user: req.user,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Allowed frontend origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

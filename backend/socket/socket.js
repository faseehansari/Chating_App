
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

let io;

const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket Authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("_id");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;

    // Online User Tracking
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    socket.join(userId);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
    });

    console.log(`User connected: ${userId}`);

    // REAL-TIME SEND MESSAGE
    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, content } = data || {};

        if (
          !mongoose.Types.ObjectId.isValid(conversationId)
        ) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID",
          });
        }

        if (
          typeof content !== "string" ||
          !content.trim()
        ) {
          return callback?.({
            success: false,
            message: "Message content is required",
          });
        }

        if (content.trim().length > 5000) {
          return callback?.({
            success: false,
            message: "Message cannot exceed 5000 characters",
          });
        }

        // Verify conversation access
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          return callback?.({
            success: false,
            message: "Conversation not found or access denied",
          });
        }

        // Find Receiver
        const receiverId = conversation.participants.find(
          (id) => id.toString() !== userId
        );

        if (!receiverId) {
          return callback?.({
            success: false,
            message: "Receiver not found",
          });
        }

        // Save Message
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
          messageType: "text",
          status: "sent",
        });

        // Update Last Message
        conversation.lastMessage = message._id;
        await conversation.save();

        // Populate Message
        const populatedMessage = await Message.findById(
          message._id
        )
          .populate("sender", "username profilePicture")
          .populate("receiver", "username profilePicture");

        // Send to Receiver's connected devices
        io.to(receiverId.toString()).emit(
          "new_message",
          populatedMessage
        );

        // Notify Sender's connected devices
        io.to(userId).emit(
          "message_sent",
          populatedMessage
        );

        // Acknowledge Sender
        callback?.({
          success: true,
          message: "Message sent successfully",
          data: populatedMessage,
        });
      } catch (error) {
        console.error("Socket Send Message Error:", error);

        callback?.({
          success: false,
          message: "Failed to send message",
        });
      }
    });

    // Disconnect Handling
    socket.on("disconnect", async () => {
      const userSockets = onlineUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          console.log(`User disconnected: ${userId}`);
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

export const getOnlineUsers = () => onlineUsers;

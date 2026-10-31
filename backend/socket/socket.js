
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

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);
    socket.join(userId);

    await User.findByIdAndUpdate(userId, { isOnline: true });

    console.log(`User connected: ${userId}`);

    // Send Message
    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, content } = data || {};

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID",
          });
        }

        if (typeof content !== "string" || !content.trim()) {
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

        const receiverId = conversation.participants.find(
          (id) => id.toString() !== userId
        );

        if (!receiverId) {
          return callback?.({
            success: false,
            message: "Receiver not found",
          });
        }

        const receiverIsOnline = onlineUsers.has(
          receiverId.toString()
        );

        const deliveredAt = receiverIsOnline ? new Date() : null;

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
          messageType: "text",
          status: receiverIsOnline ? "delivered" : "sent",
          deliveredAt,
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username profilePicture")
          .populate("receiver", "username profilePicture");

        // Send message to receiver
        io.to(receiverId.toString()).emit(
          "new_message",
          populatedMessage
        );

        // Confirm message to sender
        io.to(userId).emit("message_sent", populatedMessage);

        // Notify sender about delivery
        if (receiverIsOnline) {
          io.to(userId).emit("message_status_update", {
            messageId: message._id,
            conversationId,
            status: "delivered",
            deliveredAt,
          });
        }

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

    // Mark Messages as Read
    socket.on("mark_messages_read", async (data, callback) => {
      try {
        const { conversationId } = data || {};

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID",
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

        const now = new Date();

        // Find unread messages received by current user
        const unreadMessages = await Message.find({
          conversation: conversationId,
          receiver: userId,
          status: { $ne: "read" },
        }).select("_id sender");

        if (unreadMessages.length === 0) {
          return callback?.({
            success: true,
            message: "No unread messages",
            data: {
              updatedCount: 0,
            },
          });
        }

        // Set deliveredAt for any message not yet delivered
        await Message.updateMany(
          {
            _id: { $in: unreadMessages.map((msg) => msg._id) },
            deliveredAt: null,
          },
          {
            $set: {
              deliveredAt: now,
            },
          }
        );

        // Update messages as read
        await Message.updateMany(
          {
            _id: { $in: unreadMessages.map((msg) => msg._id) },
            status: { $ne: "read" },
          },
          {
            $set: {
              status: "read",
              readAt: now,
            },
          }
        );

        // Notify sender about read status
        for (const msg of unreadMessages) {
          io.to(msg.sender.toString()).emit(
            "message_status_update",
            {
              messageId: msg._id,
              conversationId,
              status: "read",
              readAt: now,
            }
          );
        }

        callback?.({
          success: true,
          message: "Messages marked as read",
          data: {
            updatedCount: unreadMessages.length,
          },
        });
      } catch (error) {
        console.error("Socket Mark Read Error:", error);

        callback?.({
          success: false,
          message: "Failed to mark messages as read",
        });
      }
    });

    // Disconnect
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

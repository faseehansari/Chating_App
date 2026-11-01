
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

    // Check whether this is the user's first active socket.
    const isFirstConnection = !onlineUsers.has(userId);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);
    socket.join(userId);

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      console.log(`User connected: ${userId}`);

      // Broadcast only on the first connection.
      if (isFirstConnection) {
        io.emit("user_online", {
          userId,
          isOnline: true,
        });
      }
    } catch (error) {
      console.error("User Online Update Error:", error);
    }

    // ================= SEND MESSAGE =================

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

        io.to(receiverId.toString()).emit(
          "new_message",
          populatedMessage
        );

        io.to(userId).emit("message_sent", populatedMessage);

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

    // ================= MARK MESSAGES AS READ =================

    socket.on("mark_messages_read", async (data, callback) => {
      try {
        const { conversationId } = data || {};

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID",
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

        const now = new Date();

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

    // ================= TYPING START =================

    socket.on("typing_start", async (data, callback) => {
      try {
        const { conversationId } = data || {};

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID",
          });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        }).select("participants");

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

        io.to(receiverId.toString()).emit("user_typing", {
          conversationId,
          userId,
          isTyping: true,
        });

        callback?.({
          success: true,
          message: "Typing started",
        });
      } catch (error) {
        console.error("Typing Start Error:", error);

        callback?.({
          success: false,
          message: "Failed to start typing",
        });
      }
    });

    // ================= TYPING STOP =================

    socket.on("typing_stop", async (data, callback) => {
      try {
        const { conversationId } = data || {};

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID",
          });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        }).select("participants");

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

        io.to(receiverId.toString()).emit("user_typing", {
          conversationId,
          userId,
          isTyping: false,
        });

        callback?.({
          success: true,
          message: "Typing stopped",
        });
      } catch (error) {
        console.error("Typing Stop Error:", error);

        callback?.({
          success: false,
          message: "Failed to stop typing",
        });
      }
    });

    // ================= DISCONNECT =================

    socket.on("disconnect", async () => {
      const userSockets = onlineUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        // Only mark offline when the last socket disconnects.
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          const lastSeen = new Date();

          try {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen,
            });

            console.log(`User disconnected: ${userId}`);

            // Broadcast offline status to connected clients.
            io.emit("user_offline", {
              userId,
              isOnline: false,
              lastSeen,
            });
          } catch (error) {
            console.error("User Offline Update Error:", error);
          }
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

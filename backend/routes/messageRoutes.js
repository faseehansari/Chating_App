import express from "express";
import authMiddleware from "../middelwear/authMiddleware.js";

import {
  sendMessage,
  getMessages,
  markMessagesDelivered,
  markMessagesRead,
} from "../controllers/messageController.js";

const router = express.Router();

// All message routes require authentication
router.use(authMiddleware);

// Send a message
router.post("/:conversationId", sendMessage);

// Get conversation message history
router.get("/:conversationId", getMessages);

// Mark messages as delivered
router.patch("/:conversationId/delivered", markMessagesDelivered);

// Mark messages as read
router.patch("/:conversationId/read", markMessagesRead);

export default router;
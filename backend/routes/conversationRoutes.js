import express from "express";
import authMiddleware from "../middelwear/authMiddleware.js";

import {
  createConversation,
  getMyConversations,
} from "../controllers/conversationController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createConversation);
router.get("/", getMyConversations);

export default router;
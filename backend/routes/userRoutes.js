
import express from "express";

import authMiddleware from "../middelwear/authMiddleware.js";

import {
  getAllUsers,
  searchUsers,
  getUserProfile,
  updateMyProfile,
} from "../controllers/userControllers.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all users
router.get("/", getAllUsers);

// Search users
router.get("/search", searchUsers);

// Update logged-in user's profile
router.put("/profile", updateMyProfile);

// Get single user profile
router.get("/:id", getUserProfile);

export default router;


import mongoose from "mongoose";
import User from "../models/User.js";

// ================= GET ALL USERS =================

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Exclude logged-in user
    const filter = {
      _id: { $ne: req.user.id },
    };

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("username email profilePicture isOnline lastSeen createdAt")
        .sort({ username: 1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        hasMore: page * limit < totalUsers,
      },
    });

  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ================= SEARCH USERS =================

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchTerm = query.trim();

    if (searchTerm.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Search query is too long",
      });
    }

    // Escape special regex characters
    const escapedQuery = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const users = await User.find({
      _id: { $ne: req.user.id },

      $or: [
        { username: { $regex: escapedQuery, $options: "i" } },
        { email: { $regex: escapedQuery, $options: "i" } },
      ],
    })
      .select("username email profilePicture isOnline lastSeen createdAt")
      .sort({ username: 1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      totalResults: users.length,
      users,
    });

  } catch (error) {
    console.error("Search Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ================= GET SINGLE USER PROFILE =================

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select(
      "username email profilePicture isOnline lastSeen createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });

  } catch (error) {
    console.error("Get User Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

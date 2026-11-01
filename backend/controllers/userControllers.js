
import mongoose from "mongoose";
import User from "../models/User.js";

// ================= GET ALL USERS =================

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

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

// ================= UPDATE MY PROFILE =================

export const updateMyProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (username === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide username or email to update",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updates = {};

    if (username !== undefined) {
      if (typeof username !== "string" || !username.trim()) {
        return res.status(400).json({
          success: false,
          message: "Username is required",
        });
      }

      const normalizedUsername = username.trim().toLowerCase();

      if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 3 and 30 characters",
        });
      }

      updates.username = normalizedUsername;
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      updates.email = normalizedEmail;
    }

    const duplicateConditions = [];

    if (updates.username) {
      duplicateConditions.push({ username: updates.username });
    }

    if (updates.email) {
      duplicateConditions.push({ email: updates.email });
    }

    if (duplicateConditions.length > 0) {
      const existingUser = await User.findOne({
        _id: { $ne: user._id },
        $or: duplicateConditions,
      });

      if (existingUser) {
        if (
          updates.username &&
          existingUser.username === updates.username
        ) {
          return res.status(409).json({
            success: false,
            message: "Username is already taken",
          });
        }

        if (
          updates.email &&
          existingUser.email === updates.email
        ) {
          return res.status(409).json({
            success: false,
            message: "Email is already registered",
          });
        }
      }
    }

    if (updates.username !== undefined) {
      user.username = updates.username;
    }

    if (updates.email !== undefined) {
      user.email = updates.email;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "username"
            ? "Username is already taken"
            : "Email is already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

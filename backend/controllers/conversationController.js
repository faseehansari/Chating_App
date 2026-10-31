
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

// ================= CREATE CONVERSATION =================

export const createConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        // Validate receiver ID
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Valid receiver ID is required",
            });
        }

        // Prevent chatting with yourself
        if (senderId === receiverId) {
            return res.status(400).json({
                success: false,
                message: "You cannot start a conversation with yourself",
            });
        }

        // Check receiver exists
        const receiver = await User.findById(receiverId).select("_id");

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found",
            });
        }

        // Generate unique conversation key
        const participants = [senderId, receiverId].sort();

        const conversationKey = participants.join("_");

        // Create or find existing conversation
        const conversation = await Conversation.findOneAndUpdate(
            { conversationKey },
            {
                $setOnInsert: {
                    participants,
                    conversationKey,
                },
            },
            {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true,
            }
        ).populate(
            "participants",
            "username email profilePicture isOnline lastSeen"
        );

        return res.status(200).json({
            success: true,
            message: "Conversation ready",
            conversation,
        });

    } catch (error) {
        console.error("Create Conversation Error:", error);

        // Handle duplicate conversation creation race
        if (error.code === 11000) {
            try {
                const participants = [req.user.id, req.body.receiverId].sort();

                const conversation = await Conversation.findOne({
                    conversationKey: participants.join("_"),
                }).populate(
                    "participants",
                    "username email profilePicture isOnline lastSeen"
                );

                if (conversation) {
                    return res.status(200).json({
                        success: true,
                        message: "Conversation ready",
                        conversation,
                    });
                }
            } catch (retryError) {
                console.error("Conversation Retry Error:", retryError);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// ================= GET MY CONVERSATIONS =================

export const getMyConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate(
                "participants",
                "username email profilePicture isOnline lastSeen"
            )
            .populate({
                path: "lastMessage",
                select: "content messageType sender receiver status createdAt",
            })
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Conversations fetched successfully",
            totalConversations: conversations.length,
            conversations,
        });

    } catch (error) {
        console.error("Get Conversations Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

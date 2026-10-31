
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    conversationKey: {
      type: String,
      required: true,
      unique: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure exactly two participants
conversationSchema.path("participants").validate(
  function (participants) {
    return participants.length === 2 &&
      participants[0].toString() !== participants[1].toString();
  },
  "A conversation must have exactly two different participants"
);

// Index for finding user's conversations
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;

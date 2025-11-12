import mongoose from "mongoose";

const chatThemeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: String,
      required: true, // userId for 1-on-1, groupId for group
    },
    chatType: {
      type: String,
      enum: ["user", "group"],
      required: true,
    },
    theme: {
      name: {
        type: String,
        default: "default",
      },
      primaryColor: {
        type: String,
        default: "#3b82f6",
      },
      secondaryColor: {
        type: String,
        default: "#8b5cf6",
      },
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
      backgroundImage: {
        type: String,
        default: null,
      },
      messageColor: {
        type: String,
        default: "#1f2937",
      },
      bubbleOpacity: {
        type: Number,
        default: 1,
        min: 0,
        max: 1,
      },
    },
  },
  { timestamps: true }
);

// Compound index for efficient lookup
chatThemeSchema.index({ userId: 1, chatId: 1, chatType: 1 }, { unique: true });

const ChatTheme = mongoose.model("ChatTheme", chatThemeSchema);

export default ChatTheme;

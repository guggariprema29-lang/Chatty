import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required only when this is a direct message; group messages use groupId instead
      required: function () {
        return !this.groupId;
      },
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // If message was deleted for everyone (soft-deleted globally)
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    // Track who deleted the message and when (for undo)
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // Preserve original text to support undo
    originalText: {
      type: String,
      default: null,
    },
    autoDeleteEnabled: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    detectedMood: {
      type: String,
      default: null,
    },
    // translation fields removed
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

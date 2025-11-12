import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["compliment", "feedback", "suggestion"],
      default: "feedback",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Track when it was sent (for daily limit)
    sentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
feedbackSchema.index({ recipientId: 1, createdAt: -1 });
feedbackSchema.index({ senderId: 1, recipientId: 1, sentDate: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;

import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    creatorId: {
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
    question: {
      type: String,
      required: true,
      maxlength: 200,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          maxlength: 100,
        },
        votes: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            votedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null, // null = never expires
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
pollSchema.index({ chatId: 1, createdAt: -1 });
pollSchema.index({ creatorId: 1 });

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;

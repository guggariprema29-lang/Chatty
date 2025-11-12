import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    gameType: {
      type: String,
      enum: ["tictactoe", "quiz", "typing"],
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    chatId: {
      type: String,
      required: true,
    },
    chatType: {
      type: String,
      enum: ["user", "group"],
      required: true,
    },
    gameState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

gameSchema.index({ chatId: 1, createdAt: -1 });
gameSchema.index({ isActive: 1 });
gameSchema.index({ createdBy: 1 });

const Game = mongoose.model("Game", gameSchema);

export default Game;

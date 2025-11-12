import mongoose from "mongoose";

const focusModeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    pinnedContacts: [
      {
        type: String,
      },
    ],
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// userId is already unique on the field, no separate index needed

const FocusMode = mongoose.model("FocusMode", focusModeSchema);

export default FocusMode;

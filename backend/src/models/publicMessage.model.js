import mongoose from "mongoose";

const PublicMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const PublicMessage = mongoose.model("PublicMessage", PublicMessageSchema);

export default PublicMessage;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // ISO language code preference for live translation (e.g. 'en', 'es')
    language: {
      type: String,
      default: 'en',
    },
    // Bell sound preferences for reminders
    bellSoundPreference: {
      type: String,
      enum: ['classic', 'chime', 'digital', 'gentle', 'alarm'],
      default: 'classic',
    },
    bellSoundVolume: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    bellSoundEnabled: {
      type: Boolean,
      default: true,
    },
    // Per-user chat state: store chat identifiers as strings like "user:<id>" or "group:<id>"
    archivedChats: {
      type: [String],
      default: [],
    },
    hiddenChats: {
      type: [String],
      default: [],
    },
    // groups the user has blocked (by id string)
    blockedGroups: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

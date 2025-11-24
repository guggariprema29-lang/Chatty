import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { dbConnected } from "../lib/db.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!dbConnected) {
      console.warn('Signup attempt while DB not connected');
      return res.status(503).json({ message: 'Service unavailable: database not connected' });
    }
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bellSoundPreference: newUser.bellSoundPreference,
        bellSoundVolume: newUser.bellSoundVolume,
        bellSoundEnabled: newUser.bellSoundEnabled,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!dbConnected) {
      console.warn('Login attempt while DB not connected');
      return res.status(503).json({ message: 'Service unavailable: database not connected' });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      bellSoundPreference: user.bellSoundPreference,
      bellSoundVolume: user.bellSoundVolume,
      bellSoundEnabled: user.bellSoundEnabled,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get bell sound preferences
export const getBellSoundPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select(
      "bellSoundPreference bellSoundVolume bellSoundEnabled"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      bellSoundPreference: user.bellSoundPreference,
      bellSoundVolume: user.bellSoundVolume,
      bellSoundEnabled: user.bellSoundEnabled,
    });
  } catch (error) {
    console.log("Error in getBellSoundPreferences:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update bell sound preferences
export const updateBellSoundPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bellSoundPreference, bellSoundVolume, bellSoundEnabled } = req.body;

    // Validate preference
    const validPreferences = ['classic', 'chime', 'digital', 'gentle', 'alarm'];
    if (
      bellSoundPreference &&
      !validPreferences.includes(bellSoundPreference)
    ) {
      return res.status(400).json({
        message: `Invalid bell sound. Must be one of: ${validPreferences.join(
          ", "
        )}`,
      });
    }

    // Validate volume
    if (bellSoundVolume !== undefined) {
      if (typeof bellSoundVolume !== "number" || bellSoundVolume < 0 || bellSoundVolume > 1) {
        return res
          .status(400)
          .json({ message: "Volume must be a number between 0 and 1" });
      }
    }

    const updateData = {};
    if (bellSoundPreference) updateData.bellSoundPreference = bellSoundPreference;
    if (bellSoundVolume !== undefined) updateData.bellSoundVolume = bellSoundVolume;
    if (bellSoundEnabled !== undefined) updateData.bellSoundEnabled = bellSoundEnabled;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("bellSoundPreference bellSoundVolume bellSoundEnabled");

    res.status(200).json({
      message: "Bell sound preferences updated successfully",
      bellSoundPreference: updatedUser.bellSoundPreference,
      bellSoundVolume: updatedUser.bellSoundVolume,
      bellSoundEnabled: updatedUser.bellSoundEnabled,
    });
  } catch (error) {
    console.log("Error in updateBellSoundPreferences:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get available bell sound types
export const getAvailableBellSounds = (req, res) => {
  try {
    const bellSounds = [
      {
        type: "classic",
        name: "Classic Bell",
        description: "Traditional pleasant bell tone",
        frequency1: 523.25,
        frequency2: 783.99,
      },
      {
        type: "chime",
        name: "Chime",
        description: "Soft chiming notification",
        frequency1: 392.0,
        frequency2: 523.25,
      },
      {
        type: "digital",
        name: "Digital Beep",
        description: "Electronic beeping sound",
        frequency1: 1000,
        frequency2: 800,
      },
      {
        type: "gentle",
        name: "Gentle Tone",
        description: "Soft and calming notification",
        frequency1: 440.0,
        frequency2: 554.37,
      },
      {
        type: "alarm",
        name: "Alarm",
        description: "Urgent alarm sound",
        frequency1: 800,
        frequency2: 1200,
      },
    ];

    res.status(200).json(bellSounds);
  } catch (error) {
    console.log("Error in getAvailableBellSounds:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Toggle archive chat for current user
export const toggleArchiveChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, chatType } = req.body;
    if (!chatId || !chatType) return res.status(400).json({ message: 'chatId and chatType required' });

    const key = `${chatType}:${chatId}`;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.archivedChats.indexOf(key);
    if (idx === -1) user.archivedChats.push(key);
    else user.archivedChats.splice(idx, 1);

    await user.save();
    res.status(200).json({ archivedChats: user.archivedChats });
  } catch (err) {
    console.error('Error in toggleArchiveChat:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle hide chat for current user
export const toggleHideChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, chatType } = req.body;
    if (!chatId || !chatType) return res.status(400).json({ message: 'chatId and chatType required' });

    const key = `${chatType}:${chatId}`;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const idx = user.hiddenChats.indexOf(key);
    if (idx === -1) user.hiddenChats.push(key);
    else user.hiddenChats.splice(idx, 1);

    await user.save();
    res.status(200).json({ hiddenChats: user.hiddenChats });
  } catch (err) {
    console.error('Error in toggleHideChat:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

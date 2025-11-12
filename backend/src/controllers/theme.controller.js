import ChatTheme from "../models/chatTheme.model.js";

export const saveTheme = async (req, res) => {
  try {
    const { chatId, chatType, theme } = req.body;
    const userId = req.user._id;

    if (!chatId || !chatType) {
      return res.status(400).json({ message: "Chat ID and chat type are required" });
    }

    if (!["user", "group"].includes(chatType)) {
      return res.status(400).json({ message: "Invalid chat type. Must be 'user' or 'group'" });
    }

    const existingTheme = await ChatTheme.findOne({ userId, chatId, chatType });

    if (existingTheme) {
      existingTheme.theme = { ...existingTheme.theme, ...theme };
      await existingTheme.save();

      return res.status(200).json({
        message: "Theme updated successfully",
        chatTheme: existingTheme,
      });
    }

    const chatTheme = new ChatTheme({
      userId,
      chatId,
      chatType,
      theme: theme || {},
    });

    await chatTheme.save();

    res.status(201).json({
      message: "Theme saved successfully",
      chatTheme,
    });
  } catch (error) {
    console.error("Error in saveTheme:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTheme = async (req, res) => {
  try {
    const { chatId, chatType } = req.params;
    const userId = req.user._id;

    if (!["user", "group"].includes(chatType)) {
      return res.status(400).json({ message: "Invalid chat type. Must be 'user' or 'group'" });
    }

    const chatTheme = await ChatTheme.findOne({ userId, chatId, chatType }).lean();

    if (!chatTheme) {
      return res.status(200).json({
        theme: {
          name: "default",
          primaryColor: "#3b82f6",
          secondaryColor: "#8b5cf6",
          backgroundColor: "#ffffff",
          backgroundImage: null,
          messageColor: "#1f2937",
          bubbleOpacity: 1,
        },
      });
    }

    res.status(200).json(chatTheme);
  } catch (error) {
    console.error("Error in getTheme:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllThemes = async (req, res) => {
  try {
    const userId = req.user._id;

    const themes = await ChatTheme.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json(themes);
  } catch (error) {
    console.error("Error in getAllThemes:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

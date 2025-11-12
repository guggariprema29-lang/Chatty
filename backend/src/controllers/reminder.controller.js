import Reminder from "../models/reminder.model.js";

export const createReminder = async (req, res) => {
  try {
    const { chatId, messageId, title, description, reminderTime, detectedFrom, autoDetected } = req.body;
    const userId = req.user._id;

    if (!chatId || !title || !reminderTime) {
      return res.status(400).json({ message: "Chat ID, title, and reminder time are required" });
    }

    const reminderDate = new Date(reminderTime);
    if (reminderDate <= new Date()) {
      return res.status(400).json({ message: "Reminder time must be in the future" });
    }

    const reminder = new Reminder({
      userId,
      chatId,
      messageId: messageId || null,
      title: title.trim(),
      description: description?.trim() || "",
      reminderTime: reminderDate,
      detectedFrom: detectedFrom || null,
      autoDetected: autoDetected || false,
    });

    await reminder.save();

    res.status(201).json({
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    console.error("Error in createReminder:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyReminders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, includeCompleted } = req.query;

    const filter = { userId };
    
    if (chatId) {
      filter.chatId = chatId;
    }

    if (includeCompleted !== "true") {
      filter.isCompleted = false;
    }

    const reminders = await Reminder.find(filter)
      .sort({ reminderTime: 1 })
      .populate("messageId", "text senderId createdAt")
      .lean();

    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error in getMyReminders:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUpcomingReminders = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      userId,
      isCompleted: false,
      reminderTime: { $gte: now, $lte: next24Hours },
    })
      .sort({ reminderTime: 1 })
      .populate("messageId", "text senderId createdAt")
      .lean();

    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error in getUpcomingReminders:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const completeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (String(reminder.userId) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reminder.isCompleted = true;
    await reminder.save();

    res.status(200).json({
      message: "Reminder marked as completed",
      reminder,
    });
  } catch (error) {
    console.error("Error in completeReminder:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reminder = await Reminder.findById(id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (String(reminder.userId) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Reminder.findByIdAndDelete(id);

    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReminder:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

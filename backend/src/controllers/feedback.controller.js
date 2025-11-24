import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";

// Send anonymous feedback
export const sendFeedback = async (req, res) => {
  try {
    const { recipientId, message, type } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!recipientId || !message) {
      return res.status(400).json({ message: "Recipient and message are required" });
    }

    if (String(senderId) === String(recipientId)) {
      return res.status(400).json({ message: "You cannot send feedback to yourself" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check daily limit: 1 feedback per day per recipient
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const feedbackToday = await Feedback.findOne({
      senderId,
      recipientId,
      sentDate: { $gte: today },
    });

    if (feedbackToday) {
      return res.status(429).json({ 
        message: "You can only send one anonymous feedback per person per day",
        nextAvailableTime: new Date(feedbackToday.sentDate.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Create feedback
    const feedback = new Feedback({
      senderId,
      recipientId,
      message: message.trim(),
      type: type || "feedback",
      sentDate: new Date(),
    });

    await feedback.save();

    res.status(201).json({ 
      message: "Anonymous feedback sent successfully",
      feedback: {
        _id: feedback._id,
        type: feedback.type,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error("Error in sendFeedback:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all feedback received by the current user
export const getMyFeedback = async (req, res) => {
  try {
    const userId = req.user._id;

    const feedbacks = await Feedback.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .select("-senderId") // Don't send sender info to keep it anonymous
      .lean();

    // Mark all as read
    await Feedback.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error in getMyFeedback:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get count of unread feedback
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Feedback.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check if user can send feedback to a specific person today
export const canSendFeedback = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;

    if (String(senderId) === String(recipientId)) {
      return res.status(200).json({ canSend: false, reason: "Cannot send to yourself" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const feedbackToday = await Feedback.findOne({
      senderId,
      recipientId,
      sentDate: { $gte: today },
    });

    if (feedbackToday) {
      const nextAvailable = new Date(feedbackToday.sentDate.getTime() + 24 * 60 * 60 * 1000);
      return res.status(200).json({ 
        canSend: false, 
        reason: "Daily limit reached",
        nextAvailableTime: nextAvailable
      });
    }

    res.status(200).json({ canSend: true });
  } catch (error) {
    console.error("Error in canSendFeedback:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete feedback (recipient can delete)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Only recipient can delete
    if (String(feedback.recipientId) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Feedback.findByIdAndDelete(id);

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFeedback:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

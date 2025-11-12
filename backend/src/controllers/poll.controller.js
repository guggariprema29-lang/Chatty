import Poll from "../models/poll.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new poll
export const createPoll = async (req, res) => {
  try {
    const { chatId, chatType, question, options, allowMultipleVotes, expiresIn } = req.body;
    const creatorId = req.user._id;

    // Validation
    if (!chatId || !chatType || !question || !options || options.length < 2) {
      return res.status(400).json({ 
        message: "Poll must have a question and at least 2 options" 
      });
    }

    if (options.length > 10) {
      return res.status(400).json({ 
        message: "Maximum 10 options allowed" 
      });
    }

    // Create poll options
    const pollOptions = options.map((opt) => ({
      text: opt,
      votes: [],
    }));

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn && expiresIn > 0) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresIn);
    }

    const poll = new Poll({
      creatorId,
      chatId,
      chatType,
      question,
      options: pollOptions,
      allowMultipleVotes: allowMultipleVotes || false,
      expiresAt,
    });

    await poll.save();

    // Populate creator info
    await poll.populate("creatorId", "fullName profilePic");

    // Emit to chat room
    try {
      if (chatType === "group") {
        io.to(`group:${chatId}`).emit("newPoll", poll);
      } else {
        // For 1-on-1, emit to both users if they're connected via socket
        try {
          const otherSocketId = getReceiverSocketId(chatId);
          const creatorSocketId = getReceiverSocketId(String(creatorId));
          if (otherSocketId) io.to(otherSocketId).emit("newPoll", poll);
          if (creatorSocketId) io.to(creatorSocketId).emit("newPoll", poll);
        } catch (err) {
          // fallback: emit to chatId room (no-op if nobody joined)
          io.to(chatId).emit("newPoll", poll);
        }
      }
    } catch (err) {
      console.error("Failed to emit new poll:", err);
    }

    res.status(201).json(poll);
  } catch (error) {
    console.error("Error in createPoll:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get polls for a chat
export const getPollsForChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const polls = await Poll.find({ chatId })
      .populate("creatorId", "fullName profilePic")
      .populate("options.votes.userId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(polls);
  } catch (error) {
    console.error("Error in getPollsForChat:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Vote on a poll
export const voteOnPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({ message: "This poll is closed" });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      poll.isActive = false;
      await poll.save();
      return res.status(400).json({ message: "This poll has expired" });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // Check if user already voted
    const hasVoted = poll.options.some((option) =>
      option.votes.some((vote) => String(vote.userId) === String(userId))
    );

    if (hasVoted && !poll.allowMultipleVotes) {
      // Remove previous vote
      poll.options.forEach((option) => {
        option.votes = option.votes.filter(
          (vote) => String(vote.userId) !== String(userId)
        );
      });
    }

    // Add vote to selected option
    const alreadyVotedThisOption = poll.options[optionIndex].votes.some(
      (vote) => String(vote.userId) === String(userId)
    );

    if (alreadyVotedThisOption) {
      // Remove vote (toggle)
      poll.options[optionIndex].votes = poll.options[optionIndex].votes.filter(
        (vote) => String(vote.userId) !== String(userId)
      );
    } else {
      // Add vote
      poll.options[optionIndex].votes.push({
        userId,
        votedAt: new Date(),
      });
    }

    // Update total votes
    poll.totalVotes = poll.options.reduce(
      (sum, option) => sum + option.votes.length,
      0
    );

    await poll.save();

    // Populate for response
    await poll.populate("creatorId", "fullName profilePic");
    await poll.populate("options.votes.userId", "fullName profilePic");

    // Emit update to chat room
    try {
      if (poll.chatType === "group") {
        io.to(`group:${poll.chatId}`).emit("pollUpdate", poll);
      } else {
        const otherSocketId = getReceiverSocketId(poll.chatId);
        const creatorSocketId = getReceiverSocketId(String(poll.creatorId));
        if (otherSocketId) io.to(otherSocketId).emit("pollUpdate", poll);
        if (creatorSocketId) io.to(creatorSocketId).emit("pollUpdate", poll);
      }
    } catch (err) {
      console.error("Failed to emit poll update:", err);
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error in voteOnPoll:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Close a poll (creator only)
export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user is creator
    if (String(poll.creatorId) !== String(userId)) {
      return res.status(403).json({ message: "Only the poll creator can close it" });
    }

    poll.isActive = false;
    await poll.save();

    await poll.populate("creatorId", "fullName profilePic");
    await poll.populate("options.votes.userId", "fullName profilePic");

    // Emit update
    try {
      if (poll.chatType === "group") {
        io.to(`group:${poll.chatId}`).emit("pollUpdate", poll);
      } else {
        const otherSocketId = getReceiverSocketId(poll.chatId);
        const creatorSocketId = getReceiverSocketId(String(poll.creatorId));
        if (otherSocketId) io.to(otherSocketId).emit("pollUpdate", poll);
        if (creatorSocketId) io.to(creatorSocketId).emit("pollUpdate", poll);
      }
    } catch (err) {
      console.error("Failed to emit poll close:", err);
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error in closePoll:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a poll (creator only)
export const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user is creator
    if (String(poll.creatorId) !== String(userId)) {
      return res.status(403).json({ message: "Only the poll creator can delete it" });
    }

    await Poll.findByIdAndDelete(pollId);

    // Emit deletion
    try {
      if (poll.chatType === "group") {
        io.to(`group:${poll.chatId}`).emit("pollDeleted", pollId);
      } else {
        const otherSocketId = getReceiverSocketId(poll.chatId);
        const creatorSocketId = getReceiverSocketId(String(poll.creatorId));
        if (otherSocketId) io.to(otherSocketId).emit("pollDeleted", pollId);
        if (creatorSocketId) io.to(creatorSocketId).emit("pollDeleted", pollId);
      }
    } catch (err) {
      console.error("Failed to emit poll deletion:", err);
    }

    res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error in deletePoll:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

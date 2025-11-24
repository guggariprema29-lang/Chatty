import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // enrich users with lastMessage and unreadCount
    const enriched = await Promise.all(
      filteredUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          $or: [{ isRead: false }, { isRead: { $exists: false } }],
        });

        return {
          ...user.toObject(),
          lastMessage,
          unreadCount,
        };
      })
    );

    // sort by last message time (most recent first)
    enriched.sort((a, b) => {
      const at = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bt = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bt - at;
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // find unread messages from this user to me
    const unreadMessages = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      $or: [{ isRead: false }, { isRead: { $exists: false } }],
    }).lean();

    // mark them as read
    if (unreadMessages.length > 0) {
      const ids = unreadMessages.map((m) => m._id);
      await Message.updateMany({ _id: { $in: ids } }, { $set: { isRead: true } });

      // notify the original sender that their messages were read
      try {
        const receiverSocketId = getReceiverSocketId(userToChatId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message:read", {
            readerId: myId,
            messageIds: ids,
          });
        }
      } catch (err) {
        console.error("Error emitting read receipts:", err);
      }
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    // Log full error (stack when available) for diagnostics
    console.error("Error in getMessages controller:", error);

    // If this was a network / MongoDB connection reset, return 503 Service Unavailable
    const isNetworkReset =
      (error && (error.code === 'ECONNRESET' || (error.message && error.message.includes('ECONNRESET')))) ||
      (error && error.name && error.name.toLowerCase().includes('mongonetwork')) ||
      (error && error.name === 'MongoNetworkError');

    if (isNetworkReset) {
      return res.status(503).json({ error: 'Database connection error (ECONNRESET). Please try again shortly.' });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};
export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const generateChatSummary = async (req, res) => {
  try {
    const { chatId, chatType = "user", startDate, endDate } = req.body;
    if (!chatId || !startDate || !endDate) {
      return res.status(400).json({ message: "chatId, startDate and endDate are required" });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let query = { createdAt: { $gte: start, $lte: end } };
    const myId = req.user._id;

    if (chatType === "group") {
      query.groupId = chatId;
    } else {
      query.$or = [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
      ];
    }

    const messages = await Message.find(query).populate("senderId", "fullName profilePic").sort({ createdAt: 1 }).lean();

    const totalMessages = messages.length;

    // simple topic extraction (most frequent words)
    const stopWords = new Set([
      'the','is','at','which','on','a','an','and','or','but','in','with','to','for','of','as','by','from','this','that','it','are','was','were','been','be','have','has','had','do','does','did','will','would','should','could','may','might','can','i','you','he','she','we','they','me','him','her','us','them','my','your','his','our','their','im','youre','hes','shes','were','theyre','ive','youve','weve'
    ]);

    const wordFrequency = {};
    const participantMap = new Map();
    let positive = 0, negative = 0, neutral = 0;

    // Simple keyword-based sentiment fallback when `detectedMood` is not present
    const positiveKeywords = [
      'happy','joy','joyful','excited','wonderful','amazing','great','awesome','fantastic','love','yay','celebrate','cheerful','delighted','ecstatic','grateful','congrats','congratulations'
    ];
    const negativeKeywords = [
      'sad','unhappy','depressed','down','upset','cry','tears','disappointed','hurt','pain','angry','mad','frustrated','worried','anxious','tired','sick','ill','terrible','horrible'
    ];

    messages.forEach(m => {
      // participant counts
      const sender = m.senderId;
      const senderKey = sender?._id ? String(sender._id) : String(m.senderId);
      const senderName = sender?.fullName || 'Unknown';
      const senderPic = sender?.profilePic || null;

      const curr = participantMap.get(senderKey) || { name: senderName, profilePic: senderPic, messageCount: 0 };
      curr.messageCount++;
      participantMap.set(senderKey, curr);

      // sentiment from detectedMood if present, otherwise fallback to keyword scan
      let counted = false;
      if (m.detectedMood && typeof m.detectedMood === 'string') {
        const mood = m.detectedMood.toLowerCase();
        if (mood === 'positive') { positive++; counted = true; }
        else if (mood === 'negative') { negative++; counted = true; }
        else if (mood === 'neutral') { neutral++; counted = true; }
      }

      if (!counted && m.text && typeof m.text === 'string') {
        const textLower = m.text.toLowerCase();
        // check for any positive keyword
        const hasPositive = positiveKeywords.some(k => textLower.includes(k));
        const hasNegative = negativeKeywords.some(k => textLower.includes(k));
        if (hasPositive && !hasNegative) { positive++; }
        else if (hasNegative && !hasPositive) { negative++; }
        else if (hasPositive && hasNegative) { neutral++; }
        else { neutral++; }
      }

      // topic extraction from text
      if (m.text) {
        const words = m.text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        words.forEach(w => {
          wordFrequency[w] = (wordFrequency[w] || 0) + 1;
        });
      }
    });

    const topics = Object.entries(wordFrequency).sort((a,b) => b[1]-a[1]).slice(0,5).map(([w]) => w);

    // key points - include all non-empty message texts (trimmed). Limit to reasonable max to avoid huge payloads.
    const keyPoints = messages
      .filter((m) => m && m.text && typeof m.text === 'string' && m.text.trim())
      .map((m) => {
        const t = m.text.trim();
        return t.length > 300 ? t.slice(0, 297) + '...' : t; // cap each point
      })
      .slice(0, 500); // cap total key points to 500 messages

    // participants array sorted by messageCount desc
    const activeParticipants = Array.from(participantMap.values()).sort((a,b) => b.messageCount - a.messageCount).slice(0,10);

    let dominant = null;
    if (positive > negative && positive > neutral) dominant = 'positive';
    else if (negative > positive && negative > neutral) dominant = 'negative';
    else if (neutral > 0) dominant = 'neutral';

    const sentimentBreakdown = { positive, negative, neutral };

    return res.status(200).json({
      totalMessages,
      keyPoints,
      topics,
      sentiment: dominant,
      sentimentBreakdown,
      activeParticipants
    });
  } catch (error) {
    console.error('Error in generateChatSummary:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, autoDeleteEnabled, expiresAt, detectedMood } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary with specific settings
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_messages",
        resource_type: "auto",
        allowed_formats: ["jpg", "png", "gif", "webp"],
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      autoDeleteEnabled: !!autoDeleteEnabled,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      detectedMood: detectedMood || null,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // push notifications were removed — keep behavior limited to socket emit

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, autoDeleteEnabled, expiresAt, detectedMood } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_messages",
        resource_type: "auto",
        allowed_formats: ["jpg", "png", "gif", "webp"],
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
      autoDeleteEnabled: !!autoDeleteEnabled,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      detectedMood: detectedMood || null,
    });

    await newMessage.save();

    // Populate sender info before broadcasting
    await newMessage.populate("senderId", "fullName profilePic");

    // broadcast to group room
    try {
      io.to(`group:${groupId}`).emit("newGroupMessage", newMessage);
    } catch (err) {
      console.error("Error broadcasting group message:", err);
    }

    // push notifications were removed — group broadcast is handled via socket above

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// translateOnDemand removed to restore original chat behavior

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }

    // soft-delete for the sender (delete for me)
    message.isDeleted = true;
    // preserve original text for potential undo
    if (!message.originalText) message.originalText = message.text;
    message.text = "This message was deleted";
    message.image = null;
    message.deletedBy = userId;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete message for everyone (sender or group admin can perform)
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const isSender = String(message.senderId) === String(userId);
    let isAdmin = false;
    if (message.groupId) {
      // check group admin
      const Group = (await import('../models/group.model.js')).default;
      const group = await Group.findById(message.groupId);
      if (group && group.admins && group.admins.map(String).includes(String(userId))) isAdmin = true;
    }

    if (!isSender && !isAdmin) return res.status(403).json({ error: 'Not authorized to delete for everyone' });

    if (!message.originalText) message.originalText = message.text;
    message.text = 'This message was deleted for everyone';
    message.image = null;
    message.isDeleted = true;
    message.deletedForEveryone = true;
    message.deletedBy = userId;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json(message);
  } catch (err) {
    console.error('Error in deleteMessageForEveryone:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Undo delete (restore) if the user who deleted the message calls within allowed window
export const undoDeleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (!message.isDeleted) return res.status(400).json({ error: 'Message is not deleted' });
    if (!message.deletedBy) return res.status(400).json({ error: 'Cannot undo delete' });
    if (String(message.deletedBy) !== String(userId)) return res.status(403).json({ error: 'Only the user who deleted can undo' });

    // allow undo within 2 minutes
    const ALLOW_MS = 2 * 60 * 1000;
    if (message.deletedAt && (Date.now() - new Date(message.deletedAt).getTime()) > ALLOW_MS) {
      return res.status(400).json({ error: 'Undo window expired' });
    }

    // restore
    message.text = message.originalText || '';
    message.originalText = null;
    message.isDeleted = false;
    message.deletedForEveryone = false;
    message.deletedBy = null;
    message.deletedAt = null;
    await message.save();

    res.status(200).json(message);
  } catch (err) {
    console.error('Error in undoDeleteMessage:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin delete for group (explicit endpoint) - similar to deleteMessageForEveryone but requires admin
export const adminDeleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (!message.groupId) return res.status(400).json({ error: 'Message is not a group message' });

    const Group = (await import('../models/group.model.js')).default;
    const group = await Group.findById(message.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    if (!group.admins.map(String).includes(String(userId))) return res.status(403).json({ error: 'Only group admins can perform this action' });

    if (!message.originalText) message.originalText = message.text;
    message.text = 'Message removed by group admin';
    message.isDeleted = true;
    message.deletedForEveryone = true;
    message.deletedBy = userId;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json(message);
  } catch (err) {
    console.error('Error in adminDeleteMessage:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle disappearing message (autoDeleteEnabled) and optional expiresAt
export const toggleDisappearing = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { enable, expiresAt } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    // Allow the sender to toggle. For group messages, also allow group admins.
    let isAllowed = false;
    if (String(message.senderId) === String(userId)) {
      isAllowed = true;
    } else if (message.groupId) {
      const Group = (await import('../models/group.model.js')).default;
      const group = await Group.findById(message.groupId);
      if (group && group.admins && group.admins.map(String).includes(String(userId))) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return res.status(403).json({ error: 'Not authorized to toggle disappearing', details: { messageSender: String(message.senderId), currentUser: String(userId), isGroupMessage: !!message.groupId } });
    }

    message.autoDeleteEnabled = !!enable;
    message.expiresAt = enable && expiresAt ? new Date(expiresAt) : (enable ? new Date(Date.now() + 24*60*60*1000) : null);
    await message.save();

    res.status(200).json(message);
  } catch (err) {
    console.error('Error in toggleDisappearing:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to edit this message" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const starMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.isStarred = !message.isStarred;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in starMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in pinMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

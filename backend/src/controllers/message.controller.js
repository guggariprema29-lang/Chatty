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
    console.error("Error in getUsersForSidebar: ", error.message);
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
    console.log("Error in getMessages controller: ", error.message);
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
    console.log("Error in getGroupMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
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

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.image = null;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
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

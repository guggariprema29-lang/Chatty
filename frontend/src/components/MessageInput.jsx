import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Clock, Gamepad2 } from "lucide-react";
import toast from "react-hot-toast";
import Picker from 'emoji-picker-react';
import { useAuthStore } from "../store/useAuthStore";
import { calculateExpirationDate } from "../lib/messageExpiration";
import { detectMood } from "../lib/moodDetection";
import ReminderSuggestion from "./ReminderSuggestion";
import { detectReminder } from "../lib/reminderDetection";
import { axiosInstance } from "../lib/axios";
import GameLauncher from "./GameLauncherNew";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [showAutoDeletePreview, setShowAutoDeletePreview] = useState(false);
  // poll UI removed
  const [showGameLauncher, setShowGameLauncher] = useState(false);
  const [reminderSuggestion, setReminderSuggestion] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, sendGroupMessage, selectedUser, selectedGroup } = useChatStore();
  const socket = useAuthStore.getState().socket;
  const typingRef = useRef({ timer: null, isTyping: false });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onEmojiClick = (emojiData) => {
    // emojiData.emoji contains the unicode emoji
    setText((t) => t + emojiData.emoji);
    setShowPicker(false);
  };

  const startTyping = (receiverId) => {
    if (!socket || !receiverId) return;
    if (typingRef.current.isTyping) {
      if (typingRef.current.timer) clearTimeout(typingRef.current.timer);
      typingRef.current.timer = setTimeout(() => {
        socket.emit("typing:stop", { receiverId });
        typingRef.current.isTyping = false;
        typingRef.current.timer = null;
      }, 2500);
      return;
    }

    socket.emit("typing:start", { receiverId });
    typingRef.current.isTyping = true;
    typingRef.current.timer = setTimeout(() => {
      socket.emit("typing:stop", { receiverId });
      typingRef.current.isTyping = false;
      typingRef.current.timer = null;
    }, 2500);
  };

  const stopTypingNow = (receiverId) => {
    if (!socket || !receiverId) return;
    if (typingRef.current.timer) {
      clearTimeout(typingRef.current.timer);
      typingRef.current.timer = null;
    }
    if (typingRef.current.isTyping) {
      socket.emit("typing:stop", { receiverId });
      typingRef.current.isTyping = false;
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    // Determine the target chat: prefer current selection, else first active chat
    let selectedUser = useChatStore.getState().selectedUser;
    let selectedGroup = useChatStore.getState().selectedGroup;
    if (!selectedUser && !selectedGroup) {
      const first = useChatStore.getState().getFirstActiveChat();
      if (first) {
        if (first.type === 'user') {
          // try to find user object in store
          const users = useChatStore.getState().users || [];
          const u = users.find((x) => String(x._id) === String(first.id));
          selectedUser = u || { _id: first.id, fullName: first.meta?.fullName };
        } else if (first.type === 'group') {
          const groups = useChatStore.getState().groups || [];
          const g = groups.find((x) => String(x._id) === String(first.id));
          selectedGroup = g || { _id: first.id, name: first.meta?.name };
        }
      }
    }

    // Check for reminder before sending
    const reminder = detectReminder(text.trim());
    if (reminder && !reminderSuggestion) {
      setReminderSuggestion(reminder);
      // Don't return - still send the message
    }

    // Prepare message data
    const messageData = { 
      text: text.trim(), 
      image: imagePreview,
    };

    // Add auto-delete data if enabled
    if (autoDeleteEnabled) {
      const expiresAt = calculateExpirationDate(text.trim());
      const moodData = detectMood(text.trim());
      messageData.autoDeleteEnabled = true;
      messageData.expiresAt = expiresAt;
      messageData.detectedMood = moodData?.mood || null;
    }

    try {
      if (selectedGroup) {
        // send group message
        await sendGroupMessage(selectedGroup._id, messageData);
      } else if (selectedUser) {
        await sendMessage(messageData);
      } else {
        // nothing selected
        return;
      }

      // Clear form
      setText("");
      setImagePreview(null);
  setAutoDeleteEnabled(false); // Reset auto-delete toggle
  setShowAutoDeletePreview(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (selectedUser) stopTypingNow(selectedUser._id);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleAcceptReminder = async (reminderData) => {
    try {
      // Ensure we include chatId so backend validation passes
      const chatId = selectedGroup ? selectedGroup._id : selectedUser?._id;
      if (!chatId) {
        toast.error("No chat selected for reminder");
        return;
      }
      const payload = {
        chatId,
        messageId: null,
        title: reminderData.title,
        description: reminderData.description || reminderData.title,
        reminderTime: reminderData.reminderTime,
        detectedFrom: reminderData.detectedFrom || null,
        autoDetected: reminderData.autoDetected || true,
      };

      await axiosInstance.post("/reminders", payload);
      toast.success("Reminder created! 🔔");
      setReminderSuggestion(null);
    } catch (error) {
      console.error("Failed to create reminder:", error);
      toast.error("Failed to create reminder");
    }
  };

  const handleStartGame = async (gameType, players) => {
    try {
      const chatId = selectedGroup ? selectedGroup._id : selectedUser?._id;
      const chatTypeValue = selectedGroup ? "group" : "user";
      const playersToSend = Array.isArray(players) && players.length > 0 ? players : [useAuthStore.getState().authUser._id];
      
      await axiosInstance.post("/games/create", {
        chatId,
        chatType: chatTypeValue,
        gameType: gameType.id || gameType,
        players: playersToSend,
      });
      
      toast.success(`${gameType.name || "Game"} started! 🎮`);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to start game";
      toast.error(msg);
      throw error;
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Reminder Suggestion */}
      {reminderSuggestion && (
        <ReminderSuggestion
          reminderData={reminderSuggestion}
          messageText={text}
          onAccept={handleAcceptReminder}
          onDismiss={() => setReminderSuggestion(null)}
        />
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                const selectedUser = useChatStore.getState().selectedUser;
                const selectedGroup = useChatStore.getState().selectedGroup;
                if (selectedUser && !selectedGroup) startTyping(selectedUser._id);
              }}
              onBlur={() => {
                const selectedUser = useChatStore.getState().selectedUser;
                const selectedGroup = useChatStore.getState().selectedGroup;
                if (selectedUser && !selectedGroup) stopTypingNow(selectedUser._id);
              }}
            />
            {/* Emoji picker dropdown */}
            {showPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={() => setShowPicker((v) => !v)}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>

            <button
              type="button"
              className={`hidden sm:flex btn btn-circle
                       ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>

            <div className="relative">
              <button
                type="button"
                className={`btn btn-circle ${autoDeleteEnabled ? "btn-warning" : "btn-ghost"}`}
                onClick={() => {
                  setAutoDeleteEnabled((v) => !v);
                  setShowAutoDeletePreview((v) => !v);
                }}
                title={autoDeleteEnabled ? "Auto-delete ON (based on mood)" : "Auto-delete OFF"}
              >
                <Clock size={20} />
              </button>

              {/* Inline preview that opens when auto-delete is enabled */}
              {showAutoDeletePreview && (
                <div className="absolute right-0 mt-2 w-56 bg-base-200 p-2 rounded shadow-lg text-xs z-50">
                  <div className="flex items-center justify-between">
                    <strong>Auto-delete</strong>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setShowAutoDeletePreview(false)}
                      aria-label="Close auto-delete preview"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2">
                    <AutoDeletePreview text={text} />
                  </div>
                </div>
              )}
            </div>

            {/* Poll creation removed */}

            <button
              type="button"
              className="btn btn-circle btn-ghost"
              onClick={() => setShowGameLauncher(true)}
              title="Play mini games"
            >
              <Gamepad2 size={20} />
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>

      {/* Poll Modal removed */}

      {/* Game Launcher */}
      <GameLauncher
        isOpen={showGameLauncher}
        onClose={() => setShowGameLauncher(false)}
        onStartGame={handleStartGame}
        chatId={selectedGroup ? selectedGroup._id : selectedUser?._id}
        chatType={selectedGroup ? "group" : "user"}
      />
    </div>
  );
};
export default MessageInput;

// Small helper component to preview auto-delete mood and time
const AutoDeletePreview = ({ text }) => {
  const moodData = detectMood(text || "");
  const expirationDate = calculateExpirationDate(text || "");
  const diff = Math.max(0, Math.floor((new Date(expirationDate) - new Date()) / 1000));

  const formatSeconds = (s) => {
    if (s <= 0) return "0s";
    if (s < 60) return `${s}s`;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-sm">
      <div>Detected mood: <strong>{moodData?.mood || "neutral"}</strong></div>
      <div className="opacity-80">Expires in: <strong>{formatSeconds(diff)}</strong></div>
    </div>
  );
};

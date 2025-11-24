import { useChatStore } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useEffect, useRef, useState } from "react";
import TypingIndicator from "./TypingIndicator";
import MessageContextMenu from "./MessageContextMenu";
import EditMessageModal from "./EditMessageModal";
import ForwardMessageModal from "./ForwardMessageModal";
import ShareMessageModal from "./ShareMessageModal";
import toast from "react-hot-toast";
import { Star, Pin } from "lucide-react";
import { getMoodEmoji } from "../lib/moodDetection";
import ExpiringMessage from "./ExpiringMessage";
import { isMessageExpired } from "../lib/messageExpiration";
import { axiosInstance } from "../lib/axios";
import TicTacToeGame from "./TicTacToeGame";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getGroupMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    deleteMessageForEveryone,
    undoDeleteMessage,
    adminDeleteMessage,
    toggleDisappearing,
    editMessage,
    starMessage,
    pinMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);
  const socket = useAuthStore.getState().socket;
  
  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [expiredMessages, setExpiredMessages] = useState(new Set());
  // polls feature removed
  const [games, setGames] = useState([]);
  

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      loadGames(selectedGroup._id);
    } else if (selectedUser) {
      getMessages(selectedUser._id);
      loadGames(selectedUser._id);
    }

    // subscribe to socket events; include socket in deps so handlers are registered when socket connects
    subscribeToMessages();

    // poll feature removed; no poll socket handlers

    // register game socket handlers
    let handleNewGame, handleGameUpdate, handleGameEnded;
    if (socket) {
      const normalizeGame = (g) => {
        const boardIdx = g.gameState?.board ?? g.board ?? null;
        const board = boardIdx
          ? boardIdx.map((v) => (v === null || v === undefined ? null : v === 0 ? "X" : "O"))
          : null;

        const currentPlayerIdx = g.gameState?.currentPlayer;
        const currentTurn =
          currentPlayerIdx !== null && currentPlayerIdx !== undefined && g.players
            ? g.players[currentPlayerIdx]?._id
            : null;

        let winnerSymbol = null;
        if (g.winner) {
          const winnerId = typeof g.winner === "object" ? g.winner._id : g.winner;
          if (g.players && g.players[0] && String(g.players[0]._id) === String(winnerId)) winnerSymbol = "X";
          else if (g.players && g.players[1] && String(g.players[1]._id) === String(winnerId)) winnerSymbol = "O";
        }

        return {
          ...g,
          board,
          currentTurn,
          isDraw: g.gameState?.isDraw ?? g.isDraw ?? false,
          winner: winnerSymbol,
        };
      };

      handleNewGame = (game) => {
        setGames((prev) => [normalizeGame(game), ...prev]);
        toast.success("New game started! 🎮");
      };

      handleGameUpdate = (updatedGame) => {
        const ng = normalizeGame(updatedGame);
        setGames((prev) => prev.map((game) => (game._id === ng._id ? ng : game)));
      };

      handleGameEnded = (ended) => {
        const id = ended?._id || ended;
        setGames((prev) => prev.filter((game) => game._id !== id));
      };

      socket.on("newGame", handleNewGame);
      socket.on("gameUpdate", handleGameUpdate);
      socket.on("gameEnded", handleGameEnded);
    }

    return () => {
      unsubscribeFromMessages();
  // poll feature removed; nothing to cleanup for polls
      // cleanup game handlers
      if (socket && handleNewGame) socket.off("newGame", handleNewGame);
      if (socket && handleGameUpdate) socket.off("gameUpdate", handleGameUpdate);
      if (socket && handleGameEnded) socket.off("gameEnded", handleGameEnded);
    };
    // include socket so subscriptions register after socket connects
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages, subscribeToMessages, unsubscribeFromMessages, socket]);

  // loadPolls removed

  // Poll socket handlers are registered inside the main effect so they run after socket connects

  const loadGames = async (chatId) => {
    try {
      const res = await axiosInstance.get(`/games/chat/${chatId}/active`);
      const normalizeGame = (g) => {
        const boardIdx = g.gameState?.board ?? g.board ?? null;
        const board = boardIdx
          ? boardIdx.map((v) => (v === null || v === undefined ? null : v === 0 ? "X" : "O"))
          : null;

        const currentPlayerIdx = g.gameState?.currentPlayer;
        const currentTurn =
          currentPlayerIdx !== null && currentPlayerIdx !== undefined && g.players
            ? g.players[currentPlayerIdx]?._id
            : null;

        let winnerSymbol = null;
        if (g.winner) {
          const winnerId = typeof g.winner === "object" ? g.winner._id : g.winner;
          if (g.players && g.players[0] && String(g.players[0]._id) === String(winnerId)) winnerSymbol = "X";
          else if (g.players && g.players[1] && String(g.players[1]._id) === String(winnerId)) winnerSymbol = "O";
        }

        return {
          ...g,
          board,
          currentTurn,
          isDraw: g.gameState?.isDraw ?? g.isDraw ?? false,
          winner: winnerSymbol,
        };
      };
      setGames(res.data.map(normalizeGame));
    } catch (error) {
      console.error("Failed to load games:", error);
    }
  };

  // Game socket handlers are registered inside the main effect so they run after socket connects

  const handleGameMove = async (gameId, moveData) => {
    try {
      // backend expects { move: { ... } } in the request body
      const res = await axiosInstance.post(`/games/${gameId}/move`, { move: moveData });
      const updated = res.data;
      const boardIdx = updated.gameState?.board ?? updated.board ?? null;
      const board = boardIdx
        ? boardIdx.map((v) => (v === null || v === undefined ? null : v === 0 ? "X" : "O"))
        : null;
      const currentPlayerIdx = updated.gameState?.currentPlayer;
      const currentTurn =
        currentPlayerIdx !== null && currentPlayerIdx !== undefined && updated.players
          ? updated.players[currentPlayerIdx]?._id
          : null;
      let winnerSymbol = null;
      if (updated.winner) {
        const winnerId = typeof updated.winner === "object" ? updated.winner._id : updated.winner;
        if (updated.players && updated.players[0] && String(updated.players[0]._id) === String(winnerId)) winnerSymbol = "X";
        else if (updated.players && updated.players[1] && String(updated.players[1]._id) === String(winnerId)) winnerSymbol = "O";
      }
      const ng = {
        ...updated,
        board,
        currentTurn,
        isDraw: updated.gameState?.isDraw ?? updated.isDraw ?? false,
        winner: winnerSymbol,
      };
      setGames((prev) => prev.map((game) => (game._id === gameId ? ng : game)));
    } catch {
      toast.error("Invalid move!");
    }
  };

  useEffect(() => {
  if (!socket || (!selectedUser && !selectedGroup)) return;

    const onTyping = (payload) => {
      try {
        if (!selectedUser) return;
        if (payload?.senderId && String(payload.senderId) === String(selectedUser._id)) {
          setIsTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setIsTyping(false), 2500);
        }
      } catch (err) {
        console.error("typing handler error", err);
      }
    };

    const onTypingStop = (payload) => {
      try {
        if (!selectedUser) return;
        if (payload?.senderId && String(payload.senderId) === String(selectedUser._id)) {
          setIsTyping(false);
        }
      } catch (err) {
        console.error("typing stop handler error", err);
      }
    };

    socket.on("typing", onTyping);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("typing", onTyping);
      socket.off("typing:stop", onTypingStop);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [socket, selectedUser, selectedGroup]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      message,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleCopy = (message) => {
    const text = message.text || "";
    navigator.clipboard.writeText(text);
    toast.success("Message copied!");
  };

  const handleDelete = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    if (window.confirm("Delete this message for everyone?")) {
      await deleteMessageForEveryone(messageId);
    }
  };

  const handleUndoDelete = async (messageId) => {
    await undoDeleteMessage(messageId);
  };

  const handleAdminDelete = async (messageId) => {
    if (window.confirm("Remove this message for everyone as admin?")) {
      await adminDeleteMessage(messageId);
    }
  };

  const handleToggleDisappearing = async (messageId, enable) => {
    await toggleDisappearing(messageId, enable);
  };

  const handleEdit = (message) => {
    setEditModal(message);
  };

  const handleSaveEdit = async (newText) => {
    if (editModal) {
      await editMessage(editModal._id, newText);
      setEditModal(null);
    }
  };

  const handleStar = async (messageId) => {
    await starMessage(messageId);
  };

  const handlePin = async (messageId) => {
    await pinMessage(messageId);
  };

  const handleForward = (message) => {
    setForwardModal(message);
  };

  const handleShare = (message) => {
    setShareModal(message);
  };

  const handleMessageExpire = (messageId) => {
    setExpiredMessages((prev) => new Set([...prev, messageId]));
    toast("Message disappeared", { icon: "💨", duration: 2000 });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto" style={{ background: 'var(--chat-bg, transparent)' }}>
      <ChatHeader />

      {isTyping && selectedUser && (
        <TypingIndicator name={selectedUser.fullName} />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'transparent' }}>
        {/* Display Active Games */}
        {games.map((game) => (
          <div key={game._id} className="my-3">
            {game.gameType === "tictactoe" && (
              <TicTacToeGame
                game={game}
                onMove={(moveData) => handleGameMove(game._id, moveData)}
                currentUser={authUser}
              />
            )}
          </div>
        ))}

        {/* Polls feature removed */}

        {/* Display Messages */}
        {messages
          .filter((message) => {
            // Filter out expired messages
            if (message.autoDeleteEnabled && message.expiresAt) {
              return !expiredMessages.has(message._id) && !isMessageExpired(message.expiresAt);
            }
            return true;
          })
          .map((message) => {
          const isOwnMessage = typeof message.senderId === 'object' 
            ? message.senderId._id === authUser._id 
            : message.senderId === authUser._id;
          const senderInfo = typeof message.senderId === 'object' ? message.senderId : null;
          
          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
              onContextMenu={(e) => handleContextMenu(e, message)}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? authUser.profilePic || "/avatar.png"
                        : senderInfo?.profilePic || selectedUser?.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                {selectedGroup && senderInfo && (
                  <span className="font-semibold mr-2">
                    {isOwnMessage ? "You" : senderInfo.fullName}
                  </span>
                )}
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
                {message.isEdited && (
                  <span className="text-xs opacity-50 ml-2">(edited)</span>
                )}
              </div>
            <div
              className="chat-bubble flex flex-col relative"
              style={{
                backgroundColor: isOwnMessage ? 'var(--chat-primary)' : 'var(--chat-secondary)',
                color: 'var(--chat-text)',
                opacity: 'var(--chat-bubble-opacity, 1)'
              }}
            >
              {message.isPinned && (
                <div className="absolute -top-2 -right-2 bg-warning rounded-full p-1">
                  <Pin size={12} fill="currentColor" />
                </div>
              )}
              {message.isStarred && (
                <div className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-1">
                  <Star size={12} fill="currentColor" />
                </div>
              )}
              {message.image && !message.isDeleted && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <div className="flex items-center gap-2">
                  <p className={message.isDeleted ? "italic opacity-50" : "flex-1"}>
                    {message.text}
                  </p>
                  {!message.isDeleted && getMoodEmoji(message.text) && (
                    <span 
                      className="text-2xl ml-2 mood-emoji"
                      title={`Detected mood`}
                      style={{ 
                        animation: "mood-bounce 0.5s ease-in-out",
                        display: "inline-block"
                      }}
                    >
                      {getMoodEmoji(message.text)}
                    </span>
                  )}
                </div>
              )}
            </div>
              {isOwnMessage && !selectedGroup && (
                <div className="text-xs opacity-50 ml-1 mt-1 text-right">
                  {message.isRead ? "Read" : ""}
                </div>
              )}
              
              {/* Auto-Delete Countdown */}
              {message.autoDeleteEnabled && message.expiresAt && (
                <div className="text-xs mt-1 flex items-center gap-1 justify-end">
                  <ExpiringMessage
                    expiresAt={message.expiresAt}
                    onExpire={() => handleMessageExpire(message._id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MessageInput />

      {contextMenu && (
        (() => {
          const msg = contextMenu.message;
          const isOwn = typeof msg.senderId === 'object' ? msg.senderId._id === authUser._id : msg.senderId === authUser._id;
          const isAdmin = selectedGroup && selectedGroup.admins ? selectedGroup.admins.map(a => String(a)).includes(String(authUser._id)) : false;
          const allowToggleDisappearing = isOwn || (selectedGroup && isAdmin);

          return (
            <MessageContextMenu
          message={contextMenu.message}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onDelete={() => handleDelete(contextMenu.message._id)}
          onEdit={() => handleEdit(contextMenu.message)}
          onStar={() => handleStar(contextMenu.message._id)}
          onPin={() => handlePin(contextMenu.message._id)}
          onCopy={() => handleCopy(contextMenu.message)}
          onForward={() => handleForward(contextMenu.message)}
          onShare={() => handleShare(contextMenu.message)}
          isOwnMessage={
            typeof contextMenu.message.senderId === 'object' 
              ? contextMenu.message.senderId._id === authUser._id 
              : contextMenu.message.senderId === authUser._id
          }
          onDeleteForEveryone={() => handleDeleteForEveryone(contextMenu.message._id)}
          onUndo={() => handleUndoDelete(contextMenu.message._id)}
          onAdminDelete={() => handleAdminDelete(contextMenu.message._id)}
          {...(allowToggleDisappearing ? { onToggleDisappearing: (enable) => handleToggleDisappearing(contextMenu.message._id, enable) } : {})}
          isAdmin={isAdmin}
          isGroupMessage={!!selectedGroup}
        />
          );
        })()
      )}

      {editModal && (
        <EditMessageModal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          message={editModal}
          onSave={handleSaveEdit}
        />
      )}

      {forwardModal && (
        <ForwardMessageModal
          isOpen={!!forwardModal}
          onClose={() => setForwardModal(null)}
          message={forwardModal}
        />
      )}

      {shareModal && (
        <ShareMessageModal
          isOpen={!!shareModal}
          onClose={() => setShareModal(null)}
          message={shareModal}
        />
      )}
    </div>
  );
};
export default ChatContainer;

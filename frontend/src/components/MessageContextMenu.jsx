import { useState, useRef, useEffect } from "react";
import { Copy, Forward, Star, Pin, Edit, Trash2, Share2 } from "lucide-react";

const MessageContextMenu = ({ 
  message, 
  position, 
  onClose, 
  onDelete, 
  onEdit, 
  onStar, 
  onPin, 
  onCopy, 
  onForward,
  onShare,
  isOwnMessage,
  // optional enhanced actions
  onDeleteForEveryone,
  onUndo,
  onAdminDelete,
  onToggleDisappearing,
  isAdmin,
  isGroupMessage
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-base-200 rounded-lg shadow-lg py-2 z-50 min-w-[180px]"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      {!message.isDeleted && (
        <>
          <button
            onClick={() => handleAction(onCopy)}
            className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
          >
            <Copy size={16} />
            Copy
          </button>

          {isOwnMessage && (
            <>
              <button
                onClick={() => handleAction(onEdit)}
                className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                onClick={() => handleAction(onDelete)}
                className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm text-error"
              >
                <Trash2 size={16} />
                Delete
              </button>
              {/* Delete for everyone */}
              {onDeleteForEveryone && (
                <button
                  onClick={() => handleAction(onDeleteForEveryone)}
                  className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm text-error"
                >
                  <Trash2 size={16} />
                  Delete for everyone
                </button>
              )}
            </>
          )}

          {/* Admin remove option for group messages */}
          {!isOwnMessage && isAdmin && onAdminDelete && (
            <button
              onClick={() => handleAction(onAdminDelete)}
              className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm text-error"
            >
              <Trash2 size={16} />
              Remove (admin)
            </button>
          )}

          {/* Undo deleted message (if available) */}
          {message.isDeleted && onUndo && (
            <button
              onClick={() => handleAction(onUndo)}
              className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
            >
              <Edit size={16} />
              Undo Delete
            </button>
          )}

          {/* Toggle disappearing */}
          {onToggleDisappearing && (
            <button
              onClick={() => handleAction(() => onToggleDisappearing(!message.autoDeleteEnabled))}
              className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
            >
              {message.autoDeleteEnabled ? 'Disable Disappearing' : 'Make Disappearing'}
            </button>
          )}

          <button
            onClick={() => handleAction(onStar)}
            className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
          >
            <Star size={16} fill={message.isStarred ? "currentColor" : "none"} />
            {message.isStarred ? "Unstar" : "Star"}
          </button>

          <button
            onClick={() => handleAction(onPin)}
            className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
          >
            <Pin size={16} fill={message.isPinned ? "currentColor" : "none"} />
            {message.isPinned ? "Unpin" : "Pin"}
          </button>

          <button
            onClick={() => handleAction(onForward)}
            className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
          >
            <Forward size={16} />
            Forward
          </button>

          <button
            onClick={() => handleAction(onShare)}
            className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-3 text-sm"
          >
            <Share2 size={16} />
            Share
          </button>
        </>
      )}
    </div>
  );
};

export default MessageContextMenu;

import { X, Info, Palette, FileText } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import GroupInfo from "./GroupInfo";
import SendFeedbackModal from "./SendFeedbackModal";
import ThemeSelector from "./ThemeSelector";
// Push/Notifications components removed to restore original header
// import EmotionSearch from "./EmotionSearch";
import ChatSummaryModal from "./ChatSummaryModal";
// import FocusModeToggle from "./FocusModeToggle";

const ChatHeader = () => {
  const { selectedUser, selectedGroup, setSelectedUser, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  // const [showEmotionSearch, setShowEmotionSearch] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  // const [showFocusMode, setShowFocusMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={(selectedGroup ? selectedGroup.photo : selectedUser?.profilePic) || "/avatar.png"}
                  alt={(selectedGroup ? selectedGroup.name : selectedUser?.fullName) || "Chat"}
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <h3 className="font-medium">{selectedGroup ? selectedGroup.name : selectedUser?.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {selectedGroup ? `${selectedGroup.members?.length || "0"} members` : (onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline")}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Emotion search button removed or disabled */}

            <button 
              onClick={() => setShowSummary(true)}
              className="btn btn-ghost btn-sm btn-circle"
              title="Chat Summary"
            >
              <FileText size={16} />
            </button>

            <button 
              onClick={() => setShowThemeSelector(true)}
              className="btn btn-ghost btn-sm btn-circle"
              title="Change Chat Theme"
            >
              <Palette size={16} />
            </button>

            {/* Notifications and push toggle removed */}

            {selectedUser && !selectedGroup && (
              <button 
                onClick={() => setShowFeedbackModal(true)}
                className="btn btn-ghost btn-sm btn-circle"
                title="Send Anonymous Feedback"
              >
                🎭
              </button>
            )}
            {selectedGroup && (
              <button 
                onClick={() => setShowGroupInfo(true)}
                className="btn btn-ghost btn-sm btn-circle"
                title="Group Info"
              >
                <Info size={18} />
              </button>
            )}
            <button 
              onClick={() => { if (selectedGroup) setSelectedGroup(null); else setSelectedUser(null); }}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X />
            </button>
          </div>
        </div>
      
      <GroupInfo 
        isOpen={showGroupInfo} 
        onClose={() => setShowGroupInfo(false)} 
        group={selectedGroup} 
      />
      
      <SendFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        recipient={selectedUser}
      />

      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => {
          setCurrentTheme(theme.id || theme.name);
          // Apply theme (would save to backend in production)
        }}
        contactName={selectedGroup ? selectedGroup.name : selectedUser?.fullName}
      />

      {/* <EmotionSearch
        isOpen={showEmotionSearch}
        onClose={() => setShowEmotionSearch(false)}
      /> */}

      <ChatSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
};
export default ChatHeader;

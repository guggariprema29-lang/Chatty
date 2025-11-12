import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Bell, Focus } from "lucide-react";
import { useState, useEffect } from "react";
import FeedbackInbox from "./FeedbackInbox";
import RemindersList from "./RemindersList";
import FocusModeToggle from "./FocusModeToggle";
import { axiosInstance } from "../lib/axios";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [showFeedbackInbox, setShowFeedbackInbox] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadUnreadCount();
      loadUpcomingReminders();
      // Poll every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
        loadUpcomingReminders();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [authUser]);

  const loadUnreadCount = async () => {
    try {
      const res = await axiosInstance.get("/feedback/unread-count");
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadUpcomingReminders = async () => {
    try {
      const res = await axiosInstance.get("/reminders/upcoming");
      setUpcomingCount(res.data.filter((r) => !r.isCompleted).length);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    }
  };

  const handleOpenInbox = () => {
    setShowFeedbackInbox(true);
    setUnreadCount(0); // Clear badge when opening
  };

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <button
                  onClick={() => setShowFocusMode(true)}
                  className={`btn btn-sm gap-2 ${focusModeEnabled ? "btn-warning" : "btn-ghost"}`}
                  title="Focus Mode"
                >
                  <Focus size={16} />
                  <span className="hidden sm:inline">Focus</span>
                </button>

                <button
                  onClick={() => setShowReminders(true)}
                  className="btn btn-sm gap-2 relative"
                  title="Reminders"
                >
                  <Bell size={16} />
                  <span className="hidden sm:inline">Reminders</span>
                  {upcomingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-warning text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {upcomingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleOpenInbox}
                  className="btn btn-sm gap-2 relative"
                  title="Anonymous Feedback Inbox"
                >
                  🎭
                  <span className="hidden sm:inline">Feedback</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <FeedbackInbox 
        isOpen={showFeedbackInbox} 
        onClose={() => setShowFeedbackInbox(false)} 
      />

      <RemindersList
        isOpen={showReminders}
        onClose={() => setShowReminders(false)}
      />

      <FocusModeToggle
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        isEnabled={focusModeEnabled}
        onToggle={(enabled) => setFocusModeEnabled(enabled)}
      />
    </header>
  );
};
export default Navbar;

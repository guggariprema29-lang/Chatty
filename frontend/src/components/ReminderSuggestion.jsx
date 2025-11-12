import { Bell, X, Check, Clock } from "lucide-react";
import { formatReminderTime } from "../lib/reminderDetection";

const ReminderSuggestion = ({ reminderData, onAccept, onDismiss, messageText }) => {
  if (!reminderData) return null;

  const handleAccept = () => {
    if (onAccept) {
      onAccept({
        title: reminderData.title,
        description: messageText,
        reminderTime: reminderData.reminderTime,
        detectedFrom: messageText,
        autoDetected: true,
      });
    }
  };

  return (
    <div className="bg-info/10 border border-info/30 rounded-lg p-3 mb-2 flex items-start gap-2">
      <Bell className="text-info flex-shrink-0 mt-0.5" size={16} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Create a reminder?</p>
        <p className="text-xs opacity-70 mt-1">
          Detected: <span className="font-semibold">{reminderData.title}</span>
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Clock size={12} className="opacity-70" />
          <span className="text-xs opacity-70">
            {formatReminderTime(reminderData.reminderTime)}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAccept}
            className="btn btn-xs btn-info gap-1"
          >
            <Check size={12} />
            Yes
          </button>
          <button
            onClick={onDismiss}
            className="btn btn-xs btn-ghost"
          >
            <X size={12} />
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderSuggestion;

import { useState, useEffect } from "react";
import { Bell, X, Check, Clock } from "lucide-react";
import { formatReminderTime } from "../lib/reminderDetection";
import toast from "react-hot-toast";

const ReminderNotification = ({ reminder, onDismiss, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimeLeft = () => {
      setTimeLeft(formatReminderTime(reminder.reminderTime));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [reminder.reminderTime]);

  const handleComplete = () => {
    if (onComplete) onComplete(reminder._id);
    toast.success("Reminder completed! ✓");
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss(reminder._id);
  };

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-3 animate-pulse">
      <div className="flex-shrink-0">
        <Bell className="text-warning" size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{reminder.title}</h4>
            {reminder.autoDetected && (
              <p className="text-xs opacity-70 mt-1">
                Auto-detected from: "{reminder.detectedFrom?.substring(0, 50)}..."
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Clock size={14} className="opacity-70" />
          <span className="text-xs opacity-70">{timeLeft}</span>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleComplete}
            className="btn btn-xs btn-success gap-1"
          >
            <Check size={12} />
            Complete
          </button>
          <button
            onClick={handleDismiss}
            className="btn btn-xs btn-ghost"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderNotification;

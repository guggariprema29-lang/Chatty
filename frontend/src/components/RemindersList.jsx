import { useState, useEffect } from "react";
import { Bell, X, Check, Clock, Trash2, Calendar } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { formatReminderTime } from "../lib/reminderDetection";

const RemindersList = ({ isOpen, onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("upcoming"); // upcoming, all, completed

  useEffect(() => {
    if (isOpen) {
      loadReminders();
    }
  }, [isOpen, filter]);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const endpoint = filter === "upcoming" ? "/reminders/upcoming" : "/reminders";
      const res = await axiosInstance.get(endpoint);
      let data = res.data;

      if (filter === "completed") {
        data = data.filter((r) => r.isCompleted);
      } else if (filter === "upcoming") {
        data = data.filter((r) => !r.isCompleted);
      }

      setReminders(data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      toast.error("Failed to load reminders");
    } finally {
      setIsLoading(false);
    }
  };

  const completeReminder = async (id) => {
    try {
      await axiosInstance.patch(`/reminders/${id}/complete`);
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isCompleted: true } : r))
      );
      toast.success("Reminder completed! ✓");
    } catch (error) {
      toast.error("Failed to complete reminder");
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;

    try {
      await axiosInstance.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reminder deleted");
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  };

  const isPastDue = (reminderTime) => {
    return new Date(reminderTime) < new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">My Reminders</h3>
            {reminders.length > 0 && (
              <span className="badge badge-sm">{reminders.length}</span>
            )}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 border-b flex gap-2">
          <button
            onClick={() => setFilter("upcoming")}
            className={`btn btn-sm ${filter === "upcoming" ? "btn-primary" : "btn-ghost"}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`btn btn-sm ${filter === "completed" ? "btn-primary" : "btn-ghost"}`}
          >
            Completed
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto mb-4 opacity-30" />
              <h4 className="text-lg font-semibold mb-2">No reminders</h4>
              <p className="text-sm text-gray-500">
                {filter === "upcoming"
                  ? "Your upcoming reminders will appear here"
                  : filter === "completed"
                  ? "Completed reminders will show here"
                  : "Send a message like 'Meet at 5pm' to auto-create reminders"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const pastDue = isPastDue(reminder.reminderTime);
                
                return (
                  <div
                    key={reminder._id}
                    className={`bg-base-200 rounded-lg p-4 ${
                      pastDue && !reminder.isCompleted ? "border-l-4 border-error" : ""
                    } ${reminder.isCompleted ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          {reminder.autoDetected && (
                            <span className="badge badge-xs badge-info">Auto</span>
                          )}
                          <h4 className={`font-medium ${reminder.isCompleted ? "line-through" : ""}`}>
                            {reminder.title}
                          </h4>
                        </div>

                        {reminder.description && (
                          <p className="text-sm opacity-70 mb-2 line-clamp-2">
                            {reminder.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                          <Clock size={12} className="opacity-70" />
                          <span className={pastDue && !reminder.isCompleted ? "text-error font-semibold" : "opacity-70"}>
                            {pastDue && !reminder.isCompleted
                              ? "Past due!"
                              : formatReminderTime(reminder.reminderTime)}
                          </span>
                          <span>•</span>
                          <Calendar size={12} className="opacity-70" />
                          <span className="opacity-70">
                            {new Date(reminder.reminderTime).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {!reminder.isCompleted && (
                          <button
                            onClick={() => completeReminder(reminder._id)}
                            className="btn btn-ghost btn-xs btn-circle text-success"
                            title="Mark as complete"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteReminder(reminder._id)}
                          className="btn btn-ghost btn-xs btn-circle text-error"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-base-200/50">
          <p className="text-xs text-center text-gray-600">
            💡 Tip: Type messages like "Meet at 5pm tomorrow" to auto-create reminders!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RemindersList;

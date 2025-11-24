import { useEffect, useRef } from "react";
import { playAlarmBuzzer, testAudioContext } from "../lib/buzzer";

/**
 * Hook to monitor reminders and trigger buzzer when reminder time arrives
 * Uses user's bell sound preferences
 */
export const useReminderBuzzer = (reminders = [], userPreferences = null) => {
  const notifiedRemindersRef = useRef(new Set());

  // Test audio context on preferences load
  useEffect(() => {
    if (userPreferences) {
      console.log("User preferences updated:", userPreferences);
      testAudioContext();
    }
  }, [userPreferences]);

  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();

      reminders.forEach((reminder) => {
        if (!reminder._id) return;

        // Skip if already notified or completed
        if (notifiedRemindersRef.current.has(reminder._id) || reminder.isCompleted) {
          return;
        }

        const reminderTime = new Date(reminder.reminderTime);
        const timeDiff = reminderTime - now; // milliseconds

        console.log(`Checking reminder "${reminder.title}": ${Math.round(timeDiff / 1000)}s remaining`);

        // Trigger buzzer only when reminder time arrives (within 5 seconds window)
        // This ensures it doesn't trigger early
        if (timeDiff <= 5000 && timeDiff >= -5000) {
          console.log(`🔔 Reminder time reached for: ${reminder.title}`);
          // Use user preferences or defaults
          const soundType = userPreferences?.bellSoundPreference || "classic";
          const volume = userPreferences?.bellSoundVolume ?? 0.5;
          const enabled = userPreferences?.bellSoundEnabled ?? true;

          console.log(`Sound settings - Type: ${soundType}, Volume: ${volume}, Enabled: ${enabled}`);

          if (enabled) {
            // Play 4 cycles so the buzzer is more noticeable
            playAlarmBuzzer(4, soundType, volume);
          }

          notifiedRemindersRef.current.add(reminder._id);

          // Show browser notification if available
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Reminder Alert", {
              body: reminder.title || "You have a reminder",
              icon: "/bell.png",
              tag: `reminder-${reminder._id}`,
            });
          }

          // Keep in notified set for this session
          // Will be cleared when component unmounts or reminders reload
        }
      });
    };

    // Check immediately
    checkReminders();

    // Then check every 5 seconds
    const interval = setInterval(checkReminders, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [reminders, userPreferences]);
};

/**
 * Request browser notification permission (call once on app startup)
 */
export const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.warn("Notification permission request failed:", error);
      return false;
    }
  }
  return Notification?.permission === "granted";
};

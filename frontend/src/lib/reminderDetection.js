// Smart Reminder Detection from Chat Messages
// Detects time/date mentions and extracts reminder information

/**
 * Detect if message contains time-based reminder
 */
export const detectReminder = (text) => {
  if (!text || typeof text !== "string") return null;

  const lowerText = text.toLowerCase();
  
  // Time patterns
  const timePatterns = [
    // "at 5", "at 5pm", "at 5:30", "at 17:00"
    /(?:at|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    // "5pm", "5:30pm", "17:00"
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    // "in 30 minutes", "in 2 hours"
    /in\s+(\d+)\s+(minute|minutes|min|hour|hours|hr)/i,
  ];

  // Day patterns
  const dayPatterns = [
    // "tomorrow", "today"
    /(tomorrow|today|tonight)/i,
    // "on Monday", "next Tuesday"
    /(?:on|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    // "Jan 15", "January 15th"
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
  ];

  // Action keywords that suggest a reminder
  const actionKeywords = [
    "meet", "meeting", "call", "remind", "don't forget",
    "remember", "appointment", "deadline", "due", "submit",
    "event", "party", "lunch", "dinner", "presentation",
  ];

  const hasAction = actionKeywords.some((keyword) => lowerText.includes(keyword));
  
  if (!hasAction) return null; // No action, probably not a reminder

  let detectedTime = null;
  let detectedDay = null;
  let timeMatch = null;
  let dayMatch = null;

  // Check for time patterns
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      timeMatch = match;
      break;
    }
  }

  // Check for day patterns
  for (const pattern of dayPatterns) {
    const match = text.match(pattern);
    if (match) {
      dayMatch = match;
      break;
    }
  }

  if (!timeMatch && !dayMatch) return null;

  // Parse time
  if (timeMatch) {
    detectedTime = parseTime(timeMatch);
  }

  // Parse day
  if (dayMatch) {
    detectedDay = parseDay(dayMatch);
  }

  // Construct reminder date
  const reminderDate = constructDate(detectedDay, detectedTime);

  if (!reminderDate) return null;

  // Extract title from message
  const title = extractTitle(text);

  return {
    title,
    description: text,
    reminderTime: reminderDate,
    detectedTime: timeMatch ? timeMatch[0] : null,
    detectedDay: dayMatch ? dayMatch[0] : null,
  };
};

/**
 * Parse time from match
 */
const parseTime = (match) => {
  // Check if it's "in X minutes/hours"
  if (match[0].startsWith("in")) {
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const now = new Date();
    
    if (unit.includes("minute") || unit === "min") {
      now.setMinutes(now.getMinutes() + amount);
    } else if (unit.includes("hour") || unit === "hr") {
      now.setHours(now.getHours() + amount);
    }
    
    return now;
  }

  // Regular time format
  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const period = match[3]?.toLowerCase();

  // Convert to 24-hour format
  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return { hour, minute };
};

/**
 * Parse day from match
 */
const parseDay = (match) => {
  const text = match[0].toLowerCase();
  const now = new Date();

  if (text.includes("today")) {
    return new Date(now.setHours(0, 0, 0, 0));
  }

  if (text.includes("tomorrow")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  if (text.includes("tonight")) {
    const tonight = new Date(now);
    tonight.setHours(20, 0, 0, 0);
    return tonight;
  }

  // Days of week
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < days.length; i++) {
    if (text.includes(days[i])) {
      const targetDay = i;
      const currentDay = now.getDay();
      let daysUntil = targetDay - currentDay;
      
      if (daysUntil <= 0) daysUntil += 7; // Next week
      
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysUntil);
      targetDate.setHours(0, 0, 0, 0);
      return targetDate;
    }
  }

  // Months
  const months = ["january", "february", "march", "april", "may", "june", 
                  "july", "august", "september", "october", "november", "december"];
  
  for (let i = 0; i < months.length; i++) {
    if (text.includes(months[i])) {
      const day = parseInt(match[2]);
      const targetDate = new Date(now.getFullYear(), i, day);
      
      // If date has passed this year, assume next year
      if (targetDate < now) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
      }
      
      return targetDate;
    }
  }

  return null;
};

/**
 * Construct full date from day and time
 */
const constructDate = (day, time) => {
  // If time is already a Date (from "in X minutes"), return it
  if (time instanceof Date) {
    return time;
  }

  const now = new Date();

  // If no day, assume today
  let baseDate = day || new Date(now.setHours(0, 0, 0, 0));

  // If no time, default to current time + 1 hour
  if (!time) {
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    return defaultTime;
  }

  // Set time on base date
  const reminderDate = new Date(baseDate);
  reminderDate.setHours(time.hour, time.minute, 0, 0);

  // If time has passed today, assume tomorrow
  if (reminderDate < new Date() && !day) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  return reminderDate;
};

/**
 * Extract title from message
 */
const extractTitle = (text) => {
  // Try to extract the main action
  const lowerText = text.toLowerCase();

  // Common patterns
  if (lowerText.includes("meet")) {
    return text.length <= 50 ? text : "Meeting";
  }
  if (lowerText.includes("call")) {
    return text.length <= 50 ? text : "Call";
  }
  if (lowerText.includes("deadline")) {
    return text.length <= 50 ? text : "Deadline";
  }
  if (lowerText.includes("submit")) {
    return text.length <= 50 ? text : "Submit";
  }

  // Use first 50 chars as title
  return text.length <= 50 ? text : text.substring(0, 47) + "...";
};

/**
 * Format reminder time for display
 */
export const formatReminderTime = (date) => {
  const now = new Date();
  const reminder = new Date(date);

  const diffMs = reminder - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 0) return "Past due";
  if (diffMins === 0) return "Now";
  if (diffMins < 60) return `In ${diffMins} minutes`;
  if (diffHours < 24) return `In ${diffHours} hours`;
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;

  return reminder.toLocaleDateString();
};

/**
 * Check if reminder should be shown now
 */
export const shouldNotifyReminder = (reminderTime) => {
  const now = new Date();
  const reminder = new Date(reminderTime);
  const diffMs = reminder - now;
  
  // Notify if within 5 minutes
  return diffMs <= 300000 && diffMs >= 0;
};

/**
 * Example messages for testing
 */
export const exampleReminderMessages = [
  "Let's meet at 5pm",
  "Call me tomorrow at 3",
  "Meeting at 2:30pm today",
  "Deadline is Friday at 5pm",
  "Don't forget to submit by 6",
  "Party on Saturday at 7pm",
  "Appointment at 10am tomorrow",
  "Remind me in 30 minutes",
  "Meeting in 2 hours",
];

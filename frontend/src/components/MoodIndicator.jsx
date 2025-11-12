import { getMoodEmoji, detectMood } from "../lib/moodDetection";

/**
 * MoodIndicator - Shows detected mood emoji beside message text
 * @param {string} text - Message text to analyze
 * @param {boolean} showLabel - Whether to show mood name label
 */
const MoodIndicator = ({ text, showLabel = false }) => {
  if (!text) return null;

  const moodData = detectMood(text);
  
  if (!moodData) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <span 
        className="text-xl mood-emoji"
        title={`Mood: ${moodData.mood}`}
        style={{ 
          animation: "mood-bounce 0.5s ease-in-out",
          display: "inline-block"
        }}
      >
        {moodData.emoji}
      </span>
      {showLabel && (
        <span className="text-xs opacity-70 capitalize">
          {moodData.mood}
        </span>
      )}
    </div>
  );
};

export default MoodIndicator;

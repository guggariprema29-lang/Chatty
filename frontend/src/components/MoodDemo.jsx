import { detectMood } from "../lib/moodDetection";

/**
 * MoodDemo - Demo component to showcase mood detection
 * Can be used for testing or as a settings preview
 */
const MoodDemo = () => {
  const exampleMessages = [
    "I'm so happy to see you!",
    "Feeling really sad today...",
    "I'm so tired and exhausted",
    "Can't wait for the weekend!",
    "Thank you so much for your help!",
    "Haha that's hilarious!",
    "This is so annoying!",
    "I'm confused about this",
    "OMG! I can't believe it!",
    "Happy birthday! Let's celebrate!",
    "Feeling unwell today",
    "I love this so much!",
    "Hmm, let me think about it",
    "I'm really worried about this",
    "That's so cool!",
  ];

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎭 Mood Detection Demo</h2>
      <p className="text-sm text-gray-600 mb-6">
        Messages are automatically analyzed for emotion and display a corresponding emoji
      </p>

      <div className="space-y-3">
        {exampleMessages.map((msg, idx) => {
          const mood = detectMood(msg);
          return (
            <div
              key={idx}
              className="bg-base-200 p-3 rounded-lg flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <p className="text-sm">{msg}</p>
                {mood && (
                  <p className="text-xs text-gray-500 mt-1">
                    Detected: <span className="capitalize">{mood.mood}</span> (confidence: {mood.confidence})
                  </p>
                )}
              </div>
              {mood && (
                <span
                  className="text-3xl mood-emoji"
                  title={mood.mood}
                  style={{
                    animation: "mood-bounce 0.5s ease-in-out",
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  {mood.emoji}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-info/10 rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Analyzes message text for emotion keywords</li>
          <li>Assigns confidence scores to detected moods</li>
          <li>Displays the emoji with highest confidence</li>
          <li>Works automatically on all messages</li>
        </ul>
      </div>
    </div>
  );
};

export default MoodDemo;

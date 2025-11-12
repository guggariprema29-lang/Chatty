// Message Mood Detection Utility
// Detects emotion/tone from message text and returns appropriate emoji

const moodPatterns = {
  happy: {
    emoji: "😊",
    keywords: [
      "happy", "glad", "joy", "excited", "wonderful", "amazing", "great", "awesome",
      "fantastic", "excellent", "love it", "yay", "haha", "lol", "😂", "😄", "🎉",
      "congratulations", "congrats", "celebrate", "woohoo"
    ],
  },
  sad: {
    emoji: "😢",
    keywords: [
      "sad", "unhappy", "depressed", "down", "upset", "crying", "cry", "tears",
      "disappointed", "heartbroken", "hurt", "pain", "miss you", "😢", "😭",
      "sorry to hear", "condolences", "awful", "terrible"
    ],
  },
  angry: {
    emoji: "😠",
    keywords: [
      "angry", "mad", "furious", "annoyed", "irritated", "frustrated", "hate",
      "annoying", "stupid", "damn", "hell", "wtf", "😠", "😡", "ugh", "argh",
      "pissed", "rage", "outraged"
    ],
  },
  tired: {
    emoji: "😴",
    keywords: [
      "tired", "exhausted", "sleepy", "fatigue", "worn out", "drained", "weary",
      "can't stay awake", "need sleep", "yawn", "😴", "💤", "so tired",
      "exhausting", "beat", "burnt out"
    ],
  },
  excited: {
    emoji: "🎉",
    keywords: [
      "excited", "can't wait", "looking forward", "pumped", "thrilled", "eager",
      "omg", "wow", "incredible", "unbelievable", "🎉", "🥳", "let's go",
      "yes!", "finally"
    ],
  },
  love: {
    emoji: "❤️",
    keywords: [
      "love", "adore", "cherish", "heart", "caring", "sweet", "lovely",
      "beautiful", "gorgeous", "❤️", "💕", "💖", "😍", "🥰", "miss you",
      "thinking of you", "you're the best"
    ],
  },
  confused: {
    emoji: "🤔",
    keywords: [
      "confused", "don't understand", "what", "huh", "unclear", "puzzled",
      "bewildered", "lost", "🤔", "???", "not sure", "i don't get it",
      "confusing", "uncertain"
    ],
  },
  worried: {
    emoji: "😰",
    keywords: [
      "worried", "concerned", "anxious", "nervous", "stress", "scared",
      "afraid", "fear", "panic", "😰", "😟", "😨", "hope not", "what if",
      "terrified", "uneasy"
    ],
  },
  surprised: {
    emoji: "😲",
    keywords: [
      "surprised", "shocked", "can't believe", "no way", "really", "seriously",
      "omg", "wow", "whoa", "😲", "😱", "unbelievable", "shocking",
      "unexpected", "what!"
    ],
  },
  grateful: {
    emoji: "🙏",
    keywords: [
      "thanks", "thank you", "grateful", "appreciate", "appreciate it",
      "thankful", "blessed", "🙏", "gratitude", "much appreciated",
      "you're amazing", "helpful", "kind of you"
    ],
  },
  laughing: {
    emoji: "🤣",
    keywords: [
      "haha", "lol", "lmao", "rofl", "hilarious", "funny", "joke", "laughter",
      "😂", "🤣", "hehe", "jaja", "lmfao", "dead", "dying", "can't stop laughing"
    ],
  },
  cool: {
    emoji: "😎",
    keywords: [
      "cool", "nice", "awesome", "smooth", "chill", "relaxed", "calm",
      "no problem", "sure", "sounds good", "😎", "perfect", "alright",
      "got it", "np"
    ],
  },
  sick: {
    emoji: "🤒",
    keywords: [
      "sick", "ill", "unwell", "fever", "cold", "flu", "headache",
      "not feeling well", "under the weather", "🤒", "🤢", "nauseous",
      "pain", "ache", "doctor"
    ],
  },
  celebration: {
    emoji: "🎊",
    keywords: [
      "birthday", "party", "celebration", "anniversary", "wedding",
      "graduated", "promotion", "achievement", "success", "🎊", "🎈",
      "🎂", "cheers", "toast"
    ],
  },
  thinking: {
    emoji: "💭",
    keywords: [
      "thinking", "hmm", "let me think", "considering", "wondering",
      "pondering", "maybe", "perhaps", "might", "could be", "💭",
      "not sure yet", "debating"
    ],
  },
};

/**
 * Detects the mood/emotion of a text message
 * @param {string} text - The message text to analyze
 * @returns {Object|null} - Object with emoji and mood name, or null if no clear mood detected
 */
export const detectMood = (text) => {
  if (!text || typeof text !== "string") return null;

  const lowerText = text.toLowerCase();
  const scores = {};

  // Calculate score for each mood based on keyword matches
  for (const [moodName, moodData] of Object.entries(moodPatterns)) {
    let score = 0;
    
    for (const keyword of moodData.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Give higher weight to longer, more specific keywords
        score += keyword.length > 5 ? 2 : 1;
      }
    }
    
    if (score > 0) {
      scores[moodName] = score;
    }
  }

  // Find the mood with the highest score
  const moods = Object.entries(scores);
  if (moods.length === 0) return null;

  moods.sort((a, b) => b[1] - a[1]);
  const [topMood] = moods[0];

  return {
    mood: topMood,
    emoji: moodPatterns[topMood].emoji,
    confidence: moods[0][1],
  };
};

/**
 * Get mood emoji for display
 * @param {string} text - The message text
 * @returns {string|null} - Emoji string or null
 */
export const getMoodEmoji = (text) => {
  const result = detectMood(text);
  return result ? result.emoji : null;
};

/**
 * Check if text contains strong emotion
 * @param {string} text - The message text
 * @returns {boolean}
 */
export const hasStrongEmotion = (text) => {
  const result = detectMood(text);
  return result && result.confidence >= 2;
};

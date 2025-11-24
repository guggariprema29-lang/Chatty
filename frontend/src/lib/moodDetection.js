// Message Mood Detection Utility
// Detects emotion/tone from message text and returns appropriate emoji

const moodPatterns = {
  happy: {
    emoji: "😊",
    keywords: [
      "happy", "glad", "joy", "joyful", "excited", "wonderful", "amazing", "great", 
      "awesome", "fantastic", "excellent", "love it", "yay", "haha", "lol", 
      "😂", "😄", "🎉", "congratulations", "congrats", "celebrate", "woohoo",
      "feeling good", "doing great", "feeling great", "nice", "lovely", "beautiful",
      "brilliant", "superb", "cool", "rad", "perfect", "awesome sauce", "lit",
      "cheerful", "delighted", "ecstatic", "blessed", "lucky", "grateful"
    ],
  },
  sad: {
    emoji: "😢",
    keywords: [
      "sad", "sadness", "unhappy", "depressed", "depression", "down", "upset", "crying", 
      "cry", "tears", "disappointed", "disappointment", "heartbroken", "hurt", "pain",
      "miss you", "😢", "😭", "sorry to hear", "condolences", "awful", "terrible",
      "horrible", "depressing", "gloomy", "melancholy", "blue", "down in the dumps",
      "feeling down", "low", "blue mood", "grief", "sorrowful", "dejected"
    ],
  },
  angry: {
    emoji: "😠",
    keywords: [
      "angry", "anger", "mad", "furious", "annoyed", "annoyance", "irritated", "irritating",
      "frustrated", "frustration", "hate", "annoying", "stupid", "damn", "hell", "wtf",
      "😠", "😡", "ugh", "argh", "pissed", "rage", "outraged", "fury", "fed up",
      "seething", "livid", "enraged", "furious", "irate", "cross", "upset"
    ],
  },
  tired: {
    emoji: "😴",
    keywords: [
      "tired", "tiredness", "exhausted", "exhaustion", "sleepy", "fatigue", "fatigued",
      "worn out", "drained", "weary", "weariness", "can't stay awake", "need sleep", 
      "yawn", "😴", "💤", "so tired", "exhausting", "beat", "burnt out", "burnout",
      "tuckered out", "dead tired", "knackered", "wiped out", "zonked", "zzz"
    ],
  },
  excited: {
    emoji: "🎉",
    keywords: [
      "excited", "excitement", "can't wait", "looking forward", "pumped", "thrilled",
      "eager", "omg", "wow", "incredible", "unbelievable", "🎉", "🥳", "let's go",
      "yes!", "finally", "stoked", "hyped", "cannot wait", "on cloud nine", "over the moon",
      "ecstatic", "delighted", "enthralled", "buzzing", "pumped up", "amped"
    ],
  },
  love: {
    emoji: "❤️",
    keywords: [
      "love", "adore", "cherish", "heart", "caring", "care", "sweet", "lovely",
      "beautiful", "gorgeous", "❤️", "💕", "💖", "😍", "🥰", "miss you",
      "thinking of you", "you're the best", "affection", "tender", "devoted",
      "passionate", "smitten", "infatuated", "enamored", "besotted", "darling"
    ],
  },
  confused: {
    emoji: "🤔",
    keywords: [
      "confused", "confusion", "don't understand", "what", "huh", "unclear", "puzzled",
      "bewildered", "lost", "🤔", "???", "not sure", "i don't get it", "confusing",
      "uncertain", "uncertainty", "perplexed", "baffled", "scratching my head",
      "makes no sense", "confuse", "lost in the sauce", "huh?", "pardon?"
    ],
  },
  worried: {
    emoji: "😰",
    keywords: [
      "worried", "worry", "concern", "concerned", "anxious", "anxiety", "nervous",
      "stress", "stressed", "scared", "afraid", "fear", "panic", "😰", "😟",
      "😨", "hope not", "what if", "terrified", "uneasy", "tension", "tense",
      "apprehensive", "frightened", "dreadful", "dreading", "on edge"
    ],
  },
  surprised: {
    emoji: "😲",
    keywords: [
      "surprised", "surprise", "shocked", "shock", "can't believe", "no way", 
      "really", "seriously", "omg", "wow", "whoa", "😲", "😱", "unbelievable",
      "shocking", "unexpected", "what!", "astonished", "amazed", "astounded",
      "taken aback", "blindsided", "caught off guard", "wow!", "no way!"
    ],
  },
  grateful: {
    emoji: "🙏",
    keywords: [
      "thanks", "thank you", "grateful", "gratitude", "appreciate", "appreciation",
      "appreciate it", "thankful", "blessed", "🙏", "much appreciated", "you're amazing",
      "so helpful", "kind of you", "thank god", "cheers", "ta", "thx", "tysm",
      "so grateful", "bless you", "indebted", "obliged"
    ],
  },
  laughing: {
    emoji: "🤣",
    keywords: [
      "haha", "lol", "lmao", "rofl", "hilarious", "funny", "joke", "laughter",
      "😂", "🤣", "hehe", "jaja", "lmfao", "dead", "dying", "can't stop laughing",
      "cracking up", "laughing so hard", "burst out laughing", "hilarious",
      "comedy", "comedic", "witty", "made me laugh", "lmfaooo"
    ],
  },
  cool: {
    emoji: "😎",
    keywords: [
      "cool", "nice", "awesome", "smooth", "chill", "relaxed", "calm", "no problem",
      "sure", "sounds good", "😎", "perfect", "alright", "got it", "np", "nope",
      "no worries", "all good", "rad", "sick", "dope", "sweet", "tight", "legit"
    ],
  },
  sick: {
    emoji: "🤒",
    keywords: [
      "sick", "illness", "ill", "unwell", "fever", "cold", "flu", "headache",
      "not feeling well", "under the weather", "🤒", "🤢", "nauseous", "nausea",
      "pain", "ache", "doctor", "hospital", "medicine", "symptom", "disease",
      "viral", "infection", "infected", "ailment", "complaint"
    ],
  },
  celebration: {
    emoji: "🎊",
    keywords: [
      "birthday", "party", "celebrate", "celebration", "anniversary", "wedding",
      "graduated", "graduation", "promotion", "achievement", "success", "🎊", 
      "🎈", "🎂", "cheers", "toast", "won", "victory", "champion", "winner",
      "milestone", "accomplishment", "triumph", "festive"
    ],
  },
  thinking: {
    emoji: "💭",
    keywords: [
      "thinking", "hmm", "let me think", "considering", "wondering", "wonder",
      "pondering", "maybe", "perhaps", "might", "could be", "💭", "not sure yet",
      "debating", "contemplating", "musing", "reflecting", "reflecting on",
      "seem to think", "reckon", "suspect", "believe"
    ],
  },
  romantic: {
    emoji: "💕",
    keywords: [
      "romantic", "romance", "beautiful", "sweet", "lovely", "tender", "intimate",
      "passionate", "soulmate", "forever", "always", "devoted", "commitment",
      "together", "two hearts", "💕", "💖", "❤️", "enchanted", "charmed"
    ],
  },
  playful: {
    emoji: "😜",
    keywords: [
      "playful", "play", "tease", "teasing", "just kidding", "jk", "wink", "😜",
      "😏", "mischievous", "naughty", "fun", "funky", "goofy", "silly", "wacky",
      "tongue-in-cheek", "cheeky", "impish", "full of beans"
    ],
  },
  determined: {
    emoji: "💪",
    keywords: [
      "determined", "determination", "focused", "focus", "committed", "commitment",
      "motivated", "motivation", "driven", "ambitious", "goal", "pushing through",
      "💪", "won't give up", "never surrender", "strong", "powerful", "resilient"
    ],
  },
  peaceful: {
    emoji: "☮️",
    keywords: [
      "peaceful", "peace", "calm", "calm down", "zen", "serene", "tranquil",
      "relaxed", "relaxation", "meditate", "meditation", "mindful", "serenity",
      "☮️", "chill vibes", "no stress", "harmonious", "balanced", "centered"
    ],
  },
};

/**
 * Get the opposite/positive mood when negation is detected
 * @param {string} mood - The mood that was detected
 * @returns {string} - The opposite positive mood
 */
const getOppositeMood = (mood) => {
  const opposites = {
    // Negative moods → Positive opposites
    sad: "happy",
    angry: "peaceful",
    worried: "peaceful",
    tired: "excited",
    sick: "cool",
    confused: "thinking",
    // Positive moods → Negative opposites (for negation cases)
    happy: "sad",
    excited: "tired",
    love: "sad",
    grateful: "sad",
    laughing: "sad",
    cool: "tired",
    celebration: "sad",
    thinking: "confused",
    surprised: "worried",
    playful: "tired",
    determined: "tired",
    peaceful: "angry",
    romantic: "sad",
  };
  return opposites[mood] || "sad";
};

/**
 * Check if text contains negation words before a mood keyword
 * @param {string} text - The full text
 * @param {number} keywordIndex - Index where keyword was found
 * @returns {boolean} - True if negation found nearby
 */
const hasNegationBefore = (text, keywordIndex) => {
  const negationWords = ["not", "no", "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't", "never", "hardly", "barely", "ain't", "neither"];
  
  // Check the text before the keyword (within ~50 characters)
  const beforeText = text.substring(Math.max(0, keywordIndex - 50), keywordIndex).toLowerCase();
  
  for (const negation of negationWords) {
    if (beforeText.includes(negation)) {
      // Check if it's close enough (not too far back)
      const negationIndex = beforeText.lastIndexOf(negation);
      const distance = keywordIndex - (Math.max(0, keywordIndex - 50) + negationIndex);
      if (distance < 30) {
        return true;
      }
    }
  }
  
  return false;
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
  const moodNegations = {}; // Track if mood is negated

  // Calculate score for each mood based on keyword matches
  for (const [moodName, moodData] of Object.entries(moodPatterns)) {
    let score = 0;
    let isNegated = false;
    
    for (const keyword of moodData.keywords) {
      const keywordLower = keyword.toLowerCase();
      let searchIndex = 0;
      
      // Find all occurrences of the keyword
      while ((searchIndex = lowerText.indexOf(keywordLower, searchIndex)) !== -1) {
        // Check if this keyword is negated
        const negated = hasNegationBefore(lowerText, searchIndex);
        
          // Count the keyword regardless of negation
          // We need the score to detect emotions, even if they're negated
          score += keyword.length > 5 ? 2 : 1;
        
          // Track if this keyword was negated
          if (negated) {
            isNegated = true;
          }
        
        searchIndex += keyword.length;
      }
    }
    
    if (score > 0) {
      scores[moodName] = score;
      moodNegations[moodName] = isNegated;
    }
  }

  // Find the mood with the highest score
  const moods = Object.entries(scores);
  if (moods.length === 0) return null;

  moods.sort((a, b) => b[1] - a[1]);
  const [topMood] = moods[0];
  
  // Determine final mood: if negated, show opposite emotion
  // "i am not happy" → show sad emoji (opposite of happy)
  // "i am not sad" → show happy emoji (opposite of sad)
  let finalMood = topMood;
  if (moodNegations[topMood]) {
    const oppositeMood = getOppositeMood(topMood);
    // Use opposite mood emoji
    finalMood = oppositeMood;
  }

  return {
    mood: finalMood,
    emoji: moodPatterns[finalMood].emoji,
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

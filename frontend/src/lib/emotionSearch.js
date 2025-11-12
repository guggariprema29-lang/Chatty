export const searchMessagesByEmotion = (messages, emotion) => {
  if (!messages || !emotion) return [];
  
  const emotionLower = emotion.toLowerCase();
  
  return messages.filter(message => {
    if (!message.sentiment) return false;
    
    const detectedEmotion = message.sentiment.emotion?.toLowerCase();
    const detectedMood = message.sentiment.mood?.toLowerCase();
    
    return detectedEmotion === emotionLower || detectedMood === emotionLower;
  });
};

export const filterChatsByMood = (messages, mood) => {
  if (!messages || !mood) return [];
  
  const moodLower = mood.toLowerCase();
  
  return messages.filter(message => {
    if (!message.sentiment || !message.sentiment.mood) return false;
    
    return message.sentiment.mood.toLowerCase() === moodLower;
  });
};

export const getEmotionStats = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      total: 0,
      emotions: {},
      moods: {},
      sentiments: { positive: 0, negative: 0, neutral: 0 },
      dominantEmotion: null,
      dominantMood: null,
      averageScore: 0
    };
  }
  
  const emotions = {};
  const moods = {};
  const sentiments = { positive: 0, negative: 0, neutral: 0 };
  let totalScore = 0;
  let scoreCount = 0;
  
  messages.forEach(message => {
    if (!message.sentiment) return;
    
    const { emotion, mood, score } = message.sentiment;
    
    if (emotion) {
      emotions[emotion] = (emotions[emotion] || 0) + 1;
    }
    
    if (mood) {
      moods[mood] = (moods[mood] || 0) + 1;
    }
    
    if (typeof score === 'number') {
      totalScore += score;
      scoreCount++;
      
      if (score > 0.3) sentiments.positive++;
      else if (score < -0.3) sentiments.negative++;
      else sentiments.neutral++;
    }
  });
  
  const dominantEmotion = Object.keys(emotions).length > 0
    ? Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b)
    : null;
  
  const dominantMood = Object.keys(moods).length > 0
    ? Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b)
    : null;
  
  const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
  
  return {
    total: messages.length,
    emotions,
    moods,
    sentiments,
    dominantEmotion,
    dominantMood,
    averageScore
  };
};

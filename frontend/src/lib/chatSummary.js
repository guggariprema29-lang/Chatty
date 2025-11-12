export const generateChatSummary = (messages, date = new Date()) => {
  if (!messages || messages.length === 0) {
    return {
      date: date.toLocaleDateString(),
      messageCount: 0,
      summary: ['No messages to summarize'],
      participants: [],
      duration: null
    };
  }
  
  const messageCount = messages.length;
  const participants = [...new Set(messages.map(m => m.senderId?._id || m.senderId).filter(Boolean))];
  
  const topics = getKeyTopics(messages);
  const sentiment = getSentimentOverview(messages);
  
  const summary = [];
  
  summary.push(`${messageCount} messages exchanged`);
  
  if (participants.length > 0) {
    summary.push(`${participants.length} participant${participants.length > 1 ? 's' : ''} active`);
  }
  
  if (sentiment.dominant) {
    summary.push(`Overall mood: ${sentiment.dominant}`);
  }
  
  if (topics.length > 0) {
    summary.push(`Key topics: ${topics.slice(0, 3).join(', ')}`);
  }
  
  const firstMessageTime = messages[0]?.createdAt;
  const lastMessageTime = messages[messages.length - 1]?.createdAt;
  
  let duration = null;
  if (firstMessageTime && lastMessageTime) {
    const start = new Date(firstMessageTime);
    const end = new Date(lastMessageTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins > 60) {
      duration = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    } else {
      duration = `${diffMins}m`;
    }
    
    if (diffMins > 0) {
      summary.push(`Conversation duration: ${duration}`);
    }
  }
  
  return {
    date: date.toLocaleDateString(),
    messageCount,
    summary,
    participants,
    duration
  };
};

export const getKeyTopics = (messages) => {
  if (!messages || messages.length === 0) return [];
  
  const wordFrequency = {};
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'this', 'that',
    'it', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
    'might', 'can', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their', 'im',
    'youre', 'hes', 'shes', 'were', 'theyre', 'ive', 'youve', 'weve'
  ]);
  
  messages.forEach(message => {
    if (!message.text) return;
    
    const words = message.text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });
  
  const sortedTopics = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return sortedTopics;
};

export const getSentimentOverview = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      positive: 0,
      negative: 0,
      neutral: 0,
      averageScore: 0,
      dominant: null
    };
  }
  
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  let totalScore = 0;
  let scoreCount = 0;
  
  messages.forEach(message => {
    if (!message.sentiment || typeof message.sentiment.score !== 'number') return;
    
    const score = message.sentiment.score;
    totalScore += score;
    scoreCount++;
    
    if (score > 0.3) positive++;
    else if (score < -0.3) negative++;
    else neutral++;
  });
  
  const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
  
  let dominant = null;
  if (positive > negative && positive > neutral) dominant = 'positive';
  else if (negative > positive && negative > neutral) dominant = 'negative';
  else if (neutral > 0) dominant = 'neutral';
  
  return {
    positive,
    negative,
    neutral,
    averageScore: Number(averageScore.toFixed(2)),
    dominant
  };
};

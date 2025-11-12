import { useState, useEffect } from "react";
import { Search, Smile, Frown, Angry, Heart, Meh, PartyPopper, BarChart3 } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EmotionSearch = ({ chatId, chatType = "user" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const emotions = [
    { id: "happy", label: "Happy", icon: Smile, color: "text-success" },
    { id: "sad", label: "Sad", icon: Frown, color: "text-info" },
    { id: "angry", label: "Angry", icon: Angry, color: "text-error" },
    { id: "love", label: "Love", icon: Heart, color: "text-pink-500" },
    { id: "neutral", label: "Neutral", icon: Meh, color: "text-base-content/50" },
    { id: "excited", label: "Excited", icon: PartyPopper, color: "text-warning" }
  ];

  useEffect(() => {
    if (selectedEmotions.length > 0 || searchQuery) {
      handleSearch();
    } else {
      setFilteredMessages([]);
      setStatistics(null);
    }
  }, [selectedEmotions, searchQuery]);

  const toggleEmotion = (emotionId) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(e => e !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/messages/emotion-search", {
        chatId,
        chatType,
        emotions: selectedEmotions,
        searchQuery: searchQuery.trim()
      });

      setFilteredMessages(response.data.messages || []);
      setStatistics(response.data.statistics || null);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to search messages";
      toast.error(msg);
      setFilteredMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionIcon = (emotion) => {
    const emotionData = emotions.find(e => e.id === emotion);
    if (!emotionData) return null;
    const Icon = emotionData.icon;
    return <Icon size={16} className={emotionData.color} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <Search size={16} />
            Search Messages by Emotion
          </span>
        </label>
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Filter by Emotions</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => {
            const Icon = emotion.icon;
            const isSelected = selectedEmotions.includes(emotion.id);
            return (
              <button
                key={emotion.id}
                onClick={() => toggleEmotion(emotion.id)}
                className={`
                  btn btn-sm gap-2 transition-all
                  ${isSelected ? 'btn-primary' : 'btn-outline'}
                `}
              >
                <Icon size={16} className={isSelected ? '' : emotion.color} />
                {emotion.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {statistics && (
        <div className="stats shadow w-full bg-base-200">
          <div className="stat">
            <div className="stat-figure text-primary">
              <BarChart3 size={32} />
            </div>
            <div className="stat-title">Total Messages</div>
            <div className="stat-value text-primary">{statistics.totalMessages || 0}</div>
          </div>
          
          {statistics.emotionBreakdown && (
            <div className="stat">
              <div className="stat-title">Emotion Breakdown</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(statistics.emotionBreakdown).map(([emotion, count]) => (
                  <div key={emotion} className="badge badge-outline gap-1">
                    {getEmotionIcon(emotion)}
                    {emotion}: {count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && filteredMessages.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">
            Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-3 bg-base-200 rounded-lg border border-base-300 hover:bg-base-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-6 h-6 rounded-full">
                        <img src={msg.senderId?.profilePic || "/avatar.png"} alt="sender" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      {msg.senderId?.fullName || "Unknown"}
                    </span>
                  </div>
                  {msg.emotion && (
                    <div className="flex items-center gap-1">
                      {getEmotionIcon(msg.emotion)}
                      <span className="text-xs text-base-content/70 capitalize">
                        {msg.emotion}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm mb-1">{msg.text}</p>
                <p className="text-xs text-base-content/50">
                  {formatDate(msg.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (selectedEmotions.length > 0 || searchQuery) && filteredMessages.length === 0 && (
        <div className="text-center py-8 text-base-content/50">
          <Search size={48} className="mx-auto mb-2 opacity-50" />
          <p>No messages found with selected criteria</p>
        </div>
      )}

      {!selectedEmotions.length && !searchQuery && (
        <div className="text-center py-8 text-base-content/50">
          <Smile size={48} className="mx-auto mb-2 opacity-50" />
          <p>Select emotions or enter keywords to search</p>
        </div>
      )}
    </div>
  );
};

export default EmotionSearch;

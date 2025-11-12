import { useState } from "react";
import { X, Calendar, FileText, TrendingUp, Download, Loader2, Sparkles } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ChatSummaryModal = ({ isOpen, onClose, chatId, chatType = "user" }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/messages/summary", {
        chatId,
        chatType,
        startDate,
        endDate
      });

      setSummary(response.data);
      toast.success("Summary generated!");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to generate summary";
      toast.error(msg);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!summary) return;

    const content = `
Chat Summary
Date Range: ${startDate} to ${endDate}
Total Messages: ${summary.totalMessages}

Key Points:
${summary.keyPoints?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'N/A'}

Topics Discussed:
${summary.topics?.join(', ') || 'N/A'}

Sentiment: ${summary.sentiment || 'N/A'}

Most Active Participants:
${summary.activeParticipants?.map(p => `- ${p.name}: ${p.messageCount} messages`).join('\n') || 'N/A'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-summary-${startDate}-to-${endDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary exported!");
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'neutral': return 'text-base-content/70';
      default: return 'text-base-content';
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'badge-success';
      case 'negative': return 'badge-error';
      case 'neutral': return 'badge-ghost';
      default: return 'badge-ghost';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            <h3 className="text-xl font-semibold">Chat Summary</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className="label">
            <span className="label-text flex items-center gap-2">
              <Calendar size={16} />
              Date Range
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text-alt">Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text-alt">End Date</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isLoading || !startDate || !endDate}
          className="btn btn-primary w-full mb-6 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Summary
            </>
          )}
        </button>

        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {summary && !isLoading && (
          <div className="space-y-6">
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200">
              <div className="stat">
                <div className="stat-title">Total Messages</div>
                <div className="stat-value text-primary">{summary.totalMessages || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Sentiment</div>
                <div className={`stat-value text-2xl ${getSentimentColor(summary.sentiment)}`}>
                  {summary.sentiment || 'N/A'}
                </div>
              </div>
            </div>

            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  Key Points
                </h4>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.topics && summary.topics.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Key Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.topics.map((topic, index) => (
                    <span key={index} className="badge badge-lg badge-outline">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {summary.activeParticipants && summary.activeParticipants.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Most Active Participants</h4>
                <div className="space-y-2">
                  {summary.activeParticipants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded">
                      <div className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full">
                            <img src={participant.profilePic || "/avatar.png"} alt={participant.name} />
                          </div>
                        </div>
                        <span className="font-semibold">{participant.name}</span>
                      </div>
                      <span className="badge badge-primary">{participant.messageCount} messages</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.sentimentBreakdown && (
              <div>
                <h4 className="font-semibold mb-3">Sentiment Overview</h4>
                <div className="flex gap-2">
                  {Object.entries(summary.sentimentBreakdown).map(([sentiment, count]) => (
                    <div key={sentiment} className={`badge ${getSentimentBadge(sentiment)} gap-2`}>
                      {sentiment}: {count}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-base-300">
              <button
                onClick={handleExport}
                className="btn btn-outline gap-2"
              >
                <Download size={18} />
                Export Summary
              </button>
            </div>
          </div>
        )}

        {!summary && !isLoading && (
          <div className="text-center py-12 text-base-content/50">
            <FileText size={48} className="mx-auto mb-2 opacity-50" />
            <p>Select a date range and generate a summary</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSummaryModal;

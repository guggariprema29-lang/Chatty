import { useState } from "react";
import { BarChart3, Check, Clock, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const PollCard = ({ poll, onUpdate, onDelete }) => {
  const { authUser } = useAuthStore();
  const [isVoting, setIsVoting] = useState(false);

  const isCreator = String(poll.creatorId?._id || poll.creatorId) === String(authUser._id);
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
  const isClosed = !poll.isActive || isExpired;

  // Check if user has voted
  const userVotedOptions = poll.options
    .map((option, index) => ({
      index,
      voted: option.votes?.some((vote) => 
        String(vote.userId?._id || vote.userId) === String(authUser._id)
      ),
    }))
    .filter((opt) => opt.voted)
    .map((opt) => opt.index);

  const hasVoted = userVotedOptions.length > 0;

  // Calculate percentages
  const getTotalVotes = () => {
    return poll.options.reduce((sum, option) => sum + (option.votes?.length || 0), 0);
  };

  const getPercentage = (option) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round(((option.votes?.length || 0) / total) * 100);
  };

  const handleVote = async (optionIndex) => {
    if (isClosed) {
      toast.error("This poll is closed");
      return;
    }

    setIsVoting(true);

    try {
      const response = await axiosInstance.post(`/polls/${poll._id}/vote`, {
        optionIndex,
      });

      if (onUpdate) onUpdate(response.data);
      toast.success("Vote recorded! ✓");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to vote";
      toast.error(msg);
    } finally {
      setIsVoting(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Close this poll?")) return;

    try {
      const response = await axiosInstance.put(`/polls/${poll._id}/close`);
      if (onUpdate) onUpdate(response.data);
      toast.success("Poll closed");
    } catch (error) {
      toast.error("Failed to close poll");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this poll?")) return;

    try {
      await axiosInstance.delete(`/polls/${poll._id}`);
      if (onDelete) onDelete(poll._id);
      toast.success("Poll deleted");
    } catch (error) {
      toast.error("Failed to delete poll");
    }
  };

  return (
    <div className="bg-base-200/50 rounded-lg p-4 my-2 border border-base-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-primary" />
            <span className="font-semibold text-sm">Poll</span>
            {isClosed && (
              <span className="badge badge-sm badge-ghost">Closed</span>
            )}
          </div>
          <h4 className="font-medium">{poll.question}</h4>
        </div>

        {/* Creator actions */}
        {isCreator && (
          <div className="flex gap-1">
            {!isClosed && (
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-xs"
                title="Close poll"
              >
                <Clock size={14} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs text-error"
              title="Delete poll"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option);
          const isVoted = userVotedOptions.includes(index);
          const voteCount = option.votes?.length || 0;

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={isVoting || isClosed}
              className={`w-full text-left relative overflow-hidden rounded-lg border transition-all ${
                isVoted
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary/50"
              } ${isClosed ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            >
              {/* Progress bar */}
              <div
                className={`absolute inset-0 transition-all ${
                  isVoted ? "bg-primary/20" : "bg-primary/10"
                }`}
                style={{ width: `${percentage}%` }}
              />

              {/* Content */}
              <div className="relative px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVoted && <Check size={16} className="text-primary" />}
                  <span className="text-sm">{option.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-70">{voteCount}</span>
                  <span className="text-xs font-medium min-w-[3rem] text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-xs opacity-70">
        <div className="flex items-center gap-2">
          <span>{getTotalVotes()} votes</span>
          {poll.expiresAt && !isClosed && (
            <>
              <span>•</span>
              <span>Expires {formatMessageTime(poll.expiresAt)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span>by</span>
          <span className="font-medium">
            {isCreator ? "You" : poll.creatorId?.fullName || "Someone"}
          </span>
        </div>
      </div>

      {/* Help text */}
      {!hasVoted && !isClosed && (
        <p className="text-xs text-center mt-2 opacity-50">
          Click an option to vote{poll.allowMultipleVotes && " (you can change your vote)"}
        </p>
      )}
    </div>
  );
};

export default PollCard;

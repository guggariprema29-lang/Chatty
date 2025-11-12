import { useState, useEffect } from "react";
import { X, MessageSquare, Heart, Lightbulb, Trash2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { formatMessageTime } from "../lib/utils";

const FeedbackInbox = ({ isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFeedback();
    }
  }, [isOpen]);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/feedback/my-feedback");
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Failed to load feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;

    try {
      await axiosInstance.delete(`/feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      toast.success("Feedback deleted");
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "compliment":
        return <Heart className="text-pink-500" size={20} />;
      case "feedback":
        return <MessageSquare className="text-blue-500" size={20} />;
      case "suggestion":
        return <Lightbulb className="text-yellow-500" size={20} />;
      default:
        return <MessageSquare className="text-gray-500" size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "compliment":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300";
      case "feedback":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "suggestion":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🎭 Anonymous Feedback</h3>
            {feedbacks.length > 0 && (
              <span className="badge badge-sm">{feedbacks.length}</span>
            )}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h4 className="text-lg font-semibold mb-2">No feedback yet</h4>
              <p className="text-sm text-gray-500">
                Anonymous feedback from others will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="bg-base-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getIcon(feedback.type)}
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(
                            feedback.type
                          )}`}
                        >
                          {feedback.type}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatMessageTime(feedback.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{feedback.message}</p>
                    </div>
                    <button
                      onClick={() => deleteFeedback(feedback._id)}
                      className="btn btn-ghost btn-sm btn-circle"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-base-200/50">
          <p className="text-xs text-center text-gray-600">
            All feedback is anonymous. The sender's identity is kept private.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackInbox;

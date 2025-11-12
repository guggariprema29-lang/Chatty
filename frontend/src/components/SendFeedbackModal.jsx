import { useState } from "react";
import { X, MessageSquare, Heart, Lightbulb } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const SendFeedbackModal = ({ isOpen, onClose, recipient }) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("compliment");
  const [isLoading, setIsLoading] = useState(false);

  const feedbackTypes = [
    { value: "compliment", label: "Compliment", icon: Heart, color: "text-pink-500" },
    { value: "feedback", label: "Feedback", icon: MessageSquare, color: "text-blue-500" },
    { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-yellow-500" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsLoading(true);
    
    try {
      await axiosInstance.post("/feedback/send", {
        recipientId: recipient._id,
        message: message.trim(),
        type,
      });

      toast.success("Anonymous feedback sent! 🎭");
      setMessage("");
      setType("compliment");
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to send feedback";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !recipient) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">🎭 Send Anonymous Feedback</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-info/10 rounded-lg">
          <p className="text-sm text-info-content">
            <strong>To:</strong> {recipient.fullName}
          </p>
          <p className="text-xs opacity-70 mt-1">
            Your identity will remain anonymous. Limit: 1 per person per day.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="label">
              <span className="label-text">Type</span>
            </label>
            <div className="flex gap-2">
              {feedbackTypes.map((ft) => {
                const Icon = ft.icon;
                return (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setType(ft.value)}
                    className={`flex-1 btn btn-sm ${
                      type === ft.value ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    <Icon size={16} className={ft.color} />
                    {ft.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="label">
              <span className="label-text">Message</span>
              <span className="label-text-alt">{message.length}/500</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              placeholder={
                type === "compliment"
                  ? "Write something nice..."
                  : type === "feedback"
                  ? "Share constructive feedback..."
                  : "Share your suggestion..."
              }
              className="textarea textarea-bordered w-full h-32"
              required
            />
          </div>

          {/* Examples */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-semibold">Example {type}s:</p>
            {type === "compliment" && (
              <>
                <p>• "Your presentation was amazing! Great job!"</p>
                <p>• "You're always so helpful and supportive!"</p>
              </>
            )}
            {type === "feedback" && (
              <>
                <p>• "Your code is great, but adding comments would help."</p>
                <p>• "Consider breaking tasks into smaller chunks."</p>
              </>
            )}
            {type === "suggestion" && (
              <>
                <p>• "Maybe we could try a different approach?"</p>
                <p>• "Have you considered using that new tool?"</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Send Anonymously"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendFeedbackModal;

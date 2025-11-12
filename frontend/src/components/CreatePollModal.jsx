import { useState } from "react";
import { X, Plus, Trash2, BarChart3 } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const CreatePollModal = ({ isOpen, onClose, chatId, chatType }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresIn, setExpiresIn] = useState(0); // 0 = never
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast.error("Maximum 10 options allowed");
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error("At least 2 options required");
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error("At least 2 options required");
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/polls/create", {
        chatId,
        chatType,
        question: question.trim(),
        options: validOptions,
        allowMultipleVotes: allowMultiple,
        expiresIn: expiresIn > 0 ? expiresIn : null,
      });

      toast.success("Poll created! 📊");
      
      // Reset form
      setQuestion("");
      setOptions(["", ""]);
      setExpiresIn(0);
      setAllowMultiple(false);
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create poll";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Create Poll</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question */}
          <div>
            <label className="label">
              <span className="label-text">Question</span>
              <span className="label-text-alt">{question.length}/200</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              placeholder="Where should we meet?"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="label">
              <span className="label-text">Options</span>
              <button
                type="button"
                onClick={addOption}
                className="btn btn-xs btn-ghost gap-1"
                disabled={options.length >= 10}
              >
                <Plus size={14} />
                Add
              </button>
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={100}
                    placeholder={`Option ${index + 1}`}
                    className="input input-bordered input-sm flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="label-text">Allow changing votes</span>
            </label>

            <div>
              <label className="label">
                <span className="label-text">Expires in</span>
              </label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                className="select select-bordered select-sm w-full"
              >
                <option value={0}>Never</option>
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>1 day</option>
                <option value={72}>3 days</option>
                <option value={168}>1 week</option>
              </select>
            </div>
          </div>

          {/* Submit */}
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
              className="btn btn-primary gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <BarChart3 size={18} />
                  Create Poll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;

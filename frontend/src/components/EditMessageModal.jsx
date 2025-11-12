import { useState } from "react";
import { X } from "lucide-react";

const EditMessageModal = ({ isOpen, onClose, message, onSave }) => {
  const [editedText, setEditedText] = useState(message?.text || "");

  const handleSave = () => {
    if (editedText.trim()) {
      onSave(editedText);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Message</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="textarea textarea-bordered w-full h-32 mb-4"
          placeholder="Type your message..."
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editedText.trim()}
            className="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;

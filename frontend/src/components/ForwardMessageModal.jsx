import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";

const ForwardMessageModal = ({ isOpen, onClose, message }) => {
  const { users, groups, sendMessage, sendGroupMessage } = useChatStore();
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedRecipients([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  const allContacts = [
    ...users.map(u => ({ ...u, type: 'user' })),
    ...groups.map(g => ({ ...g, type: 'group', fullName: g.name }))
  ];

  const filteredContacts = allContacts.filter(contact =>
    contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRecipient = (contact) => {
    const id = contact._id;
    setSelectedRecipients(prev =>
      prev.find(r => r._id === id)
        ? prev.filter(r => r._id !== id)
        : [...prev, contact]
    );
  };

  const handleForward = async () => {
    for (const recipient of selectedRecipients) {
      const messageData = {
        text: message.text || "",
        image: message.image || "",
      };

      if (recipient.type === 'group') {
        await sendGroupMessage(recipient._id, messageData);
      } else {
        // We need to temporarily set the selected user to send the message
        const currentSelected = useChatStore.getState().selectedUser;
        useChatStore.setState({ selectedUser: recipient });
        await sendMessage(messageData);
        useChatStore.setState({ selectedUser: currentSelected });
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Forward Message</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full mb-4"
        />

        <div className="max-h-64 overflow-y-auto mb-4 border rounded-lg p-2">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No contacts found</p>
          ) : (
            filteredContacts.map(contact => (
              <label key={contact._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRecipients.some(r => r._id === contact._id)}
                  onChange={() => toggleRecipient(contact)}
                  className="checkbox checkbox-sm"
                />
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img src={contact.profilePic || contact.groupImage || "/avatar.png"} alt={contact.fullName} />
                  </div>
                </div>
                <span>{contact.fullName}</span>
                {contact.type === 'group' && (
                  <span className="badge badge-sm ml-auto">Group</span>
                )}
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={selectedRecipients.length === 0}
            className="btn btn-primary"
          >
            Forward to {selectedRecipients.length || 0}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;

import { useState, useEffect } from "react";
import { Focus, X, Clock, UserCheck } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const FocusModeToggle = ({ isOpen, onClose }) => {
  const { users, groups } = useChatStore();
  const [isActive, setIsActive] = useState(false);
  const [pinnedContacts, setPinnedContacts] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const focusMode = localStorage.getItem("focusMode");
    if (focusMode) {
      const data = JSON.parse(focusMode);
      setIsActive(data.isActive);
      setPinnedContacts(data.pinnedContacts || []);
      setStartTime(data.startTime || "");
      setEndTime(data.endTime || "");
    }
  }, [isOpen]);

  const allContacts = [
    ...users.map(u => ({ ...u, type: 'user' })),
    ...groups.map(g => ({ ...g, type: 'group', fullName: g.name }))
  ];

  const filteredContacts = allContacts.filter(contact =>
    contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleContact = (contact) => {
    setPinnedContacts(prev => {
      const exists = prev.find(c => c._id === contact._id);
      if (exists) {
        return prev.filter(c => c._id !== contact._id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleSave = () => {
    if (isActive && pinnedContacts.length === 0) {
      toast.error("Please select at least one contact for focus mode");
      return;
    }

    const focusData = {
      isActive,
      pinnedContacts,
      startTime,
      endTime
    };

    localStorage.setItem("focusMode", JSON.stringify(focusData));
    toast.success(isActive ? "Focus mode activated! 🎯" : "Focus mode deactivated");
    onClose();
  };

  const handleToggleActive = (active) => {
    setIsActive(active);
    if (!active) {
      setPinnedContacts([]);
      setStartTime("");
      setEndTime("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Focus className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Focus Mode</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => handleToggleActive(e.target.checked)}
              className="toggle toggle-primary"
            />
            <span className="label-text font-semibold">
              {isActive ? 'Focus Mode Active' : 'Focus Mode Inactive'}
            </span>
          </label>
          {isActive && (
            <div className="flex items-center gap-2 mt-2 text-xs text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Only pinned contacts are visible</span>
            </div>
          )}
        </div>

        {isActive && (
          <>
            <div className="mb-4">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Clock size={16} />
                  Schedule (Optional)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">
                    <span className="label-text-alt">Start Time</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text-alt">End Time</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <UserCheck size={16} />
                  Pinned Contacts ({pinnedContacts.length})
                </span>
              </label>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-sm w-full mb-2"
              />
              <div className="border rounded-lg p-2 max-h-48 overflow-y-auto bg-base-200">
                {filteredContacts.length === 0 ? (
                  <p className="text-center text-sm text-base-content/50 py-4">
                    No contacts found
                  </p>
                ) : (
                  filteredContacts.map(contact => (
                    <label
                      key={contact._id}
                      className="flex items-center gap-3 p-2 hover:bg-base-300 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pinnedContacts.some(c => c._id === contact._id)}
                        onChange={() => toggleContact(contact)}
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full">
                          <img
                            src={contact.profilePic || contact.groupImage || "/avatar.png"}
                            alt={contact.fullName}
                          />
                        </div>
                      </div>
                      <span className="text-sm">{contact.fullName}</span>
                      {contact.type === 'group' && (
                        <span className="badge badge-xs ml-auto">Group</span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {pinnedContacts.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-base-content/70 mb-2">Selected contacts:</p>
                <div className="flex flex-wrap gap-2">
                  {pinnedContacts.map(contact => (
                    <div
                      key={contact._id}
                      className="badge badge-primary gap-2"
                    >
                      {contact.fullName}
                      <button
                        onClick={() => toggleContact(contact)}
                        className="btn btn-ghost btn-xs btn-circle p-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary gap-2">
            <Focus size={18} />
            {isActive ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusModeToggle;

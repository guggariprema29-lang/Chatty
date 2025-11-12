import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup, setSelectedGroup } = useChatStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // load users for member selection using axiosInstance (correct baseURL & cookies)
    const load = async () => {
      try {
        const res = await axiosInstance.get("/messages/users");
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users for groups", err);
      }
    };
    if (isOpen) load();
  }, [isOpen]);

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        memberIds: selectedMemberIds,
      };
      const newGroup = await createGroup(payload);
      setName("");
      setDescription("");
      setSelectedMemberIds([]);
      onClose();
      // Open the newly created group
      if (newGroup) {
        setSelectedGroup(newGroup);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-md w-full max-w-md p-4">
        <h3 className="font-medium mb-3">Create Group</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="input w-full"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="textarea w-full"
          />

          <div className="max-h-40 overflow-auto border p-2 rounded">
            <div className="text-sm mb-2">Add members</div>
            {users.map((u) => (
              <label key={u._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedMemberIds.includes(u._id)}
                  onChange={() => toggleMember(u._id)}
                  className="checkbox"
                />
                <span>{u.fullName}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;

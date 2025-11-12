import { useState } from "react";
import { Users, UserPlus, Settings, X } from "lucide-react";

const GroupInfo = ({ isOpen, onClose, group }) => {
  if (!isOpen || !group) return null;

  const totalMembers = group.members?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Group Info</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Group Photo & Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="avatar mb-3">
            <div className="w-24 h-24 rounded-full">
              <img src={group.photo || "/avatar.png"} alt={group.name} />
            </div>
          </div>
          <h2 className="text-xl font-bold">{group.name}</h2>
          {group.description && (
            <p className="text-sm text-gray-500 mt-2 text-center">{group.description}</p>
          )}
        </div>

        {/* Members Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span className="font-semibold">{totalMembers} Members</span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {group.members?.map((member) => (
              <div key={member.user?._id || member._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img 
                      src={member.user?.profilePic || "/avatar.png"} 
                      alt={member.user?.fullName || "Member"} 
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{member.user?.fullName || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{member.user?.email || ""}</p>
                </div>
                {group.admins?.some(admin => 
                  String(admin) === String(member.user?._id || member.user)
                ) && (
                  <span className="badge badge-sm badge-primary">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Group Stats */}
        <div className="bg-base-200 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created</span>
            <span>{new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type</span>
            <span>{group.isPublic ? "Public" : "Private"}</span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;

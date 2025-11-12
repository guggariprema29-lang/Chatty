import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroupModal from "./CreateGroupModal";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, groups, getGroups, selectedGroup, setSelectedGroup } = useChatStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = (users || [])
    .filter((user) => {
      if (showOnlineOnly && !onlineUsers.includes(user._id)) return false;
      if (!query) return true;
      return user.fullName.toLowerCase().includes(query.toLowerCase());
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Search bar */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search contacts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input input-sm input-bordered w-full rounded-md"
          />
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Groups list */}
        <div className="px-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Groups</div>
            <button className="btn btn-xs" onClick={() => setIsCreateOpen(true)}>New</button>
          </div>
          {groups?.map((g) => (
            <button
              key={g._id}
              onClick={() => {
                setSelectedGroup(g);
              }}
              className={`w-full p-2 flex items-center gap-3 hover:bg-base-300 transition-colors rounded-md ${
                selectedUser === null && selectedGroup?._id === g._id ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              <img src={g.photo || "/avatar.png"} alt={g.name} className="size-10 rounded-full object-cover" />
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{g.name}</div>
                <div className="text-sm text-zinc-400 truncate">{g.lastMessage?.text || g.description}</div>
              </div>
              {g.unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{g.unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Create Group Modal */}
        {isCreateOpen && (
          <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        )}

        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {user.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {user.unreadCount}
                </span>
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400 truncate">
                {user.lastMessage?.text ? user.lastMessage.text : (onlineUsers.includes(user._id) ? "Online" : "Offline")}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  // recently opened chats (most-recent first): { type: 'user'|'group', id, meta }
  activeChats: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to load users";
      toast.error(msg);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // manage active chats: push when user opens a chat
  pushActiveChat: (chat) => {
    const { activeChats } = get();
    const key = `${chat.type}:${chat.id}`;
    const filtered = (activeChats || []).filter((c) => `${c.type}:${c.id}` !== key);
    const newList = [chat, ...filtered].slice(0, 10); // cap
    set({ activeChats: newList });
    try {
      localStorage.setItem('activeChats', JSON.stringify(newList));
    } catch {}
  },

  getFirstActiveChat: () => {
    const { activeChats } = get();
    return (activeChats && activeChats.length > 0) ? activeChats[activeChats.length - 1] : (activeChats && activeChats[0]) || null;
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to load groups";
      toast.error(msg);
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      // prepend to groups
      set({ groups: [res.data, ...(get().groups || [])] });
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to create group";
      toast.error(msg);
      throw error;
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ messages: res.data });
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to load group messages";
      toast.error(msg);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Restore persisted state on load
  __restoreFromStorage: () => {
    try {
      const su = localStorage.getItem('selectedUser');
      const sg = localStorage.getItem('selectedGroup');
      const ac = localStorage.getItem('activeChats');
      if (su) set({ selectedUser: JSON.parse(su) });
      if (sg) set({ selectedGroup: JSON.parse(sg) });
      if (ac) set({ activeChats: JSON.parse(ac) });
    } catch {
      // ignore
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send-group/${groupId}`, messageData);
      // append if current group
      set({ messages: [...messages, res.data] });

      // update groups list lastMessage and move to top
      const groups = get().groups || [];
      const idx = groups.findIndex((g) => String(g._id) === String(groupId));
      if (idx !== -1) {
        const group = groups[idx];
        const updatedGroup = { ...group, lastMessage: res.data };
        const newGroups = [updatedGroup, ...groups.slice(0, idx), ...groups.slice(idx + 1)];
        set({ groups: newGroups });
      }

      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to send group message";
      toast.error(msg);
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      // update users list: set lastMessage and move selected user to top
      const users = get().users || [];
      const idx = users.findIndex((u) => String(u._id) === String(selectedUser._id));
      if (idx !== -1) {
        const user = users[idx];
        const updatedUser = { ...user, lastMessage: res.data, unreadCount: 0 };
        const newUsers = [updatedUser, ...users.slice(0, idx), ...users.slice(idx + 1)];
        set({ users: newUsers });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to send message";
      toast.error(msg);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // avoid duplicate handlers
    socket.off("newMessage");
    socket.off("message:read");

    socket.on("newMessage", (newMessage) => {
      const selectedUser = get().selectedUser;

      if (selectedUser && String(newMessage.senderId) === String(selectedUser._id)) {
        // message for open chat - append and ensure this user's unreadCount is cleared
        set({ messages: [...get().messages, newMessage] });

        const users = get().users || [];
        const idx = users.findIndex((u) => String(u._id) === String(selectedUser._id));
        if (idx !== -1) {
          const user = users[idx];
          const updatedUser = { ...user, lastMessage: newMessage, unreadCount: 0 };
          const newUsers = [updatedUser, ...users.slice(0, idx), ...users.slice(idx + 1)];
          set({ users: newUsers });
        }
      } else {
        // message from another user - increment unread and move to top
        const users = get().users || [];
        const idx = users.findIndex((u) => String(u._id) === String(newMessage.senderId));
        if (idx !== -1) {
          const user = users[idx];
          const updatedUser = {
            ...user,
            lastMessage: newMessage,
            unreadCount: (user.unreadCount || 0) + 1,
          };
          const newUsers = [updatedUser, ...users.slice(0, idx), ...users.slice(idx + 1)];
          set({ users: newUsers });
        } else {
          // fallback: refresh users list
          get().getUsers();
        }
      }
    });

    socket.off("newGroupMessage");
    socket.on("newGroupMessage", (newMessage) => {
      const selectedGroup = get().selectedGroup;

      if (selectedGroup && String(newMessage.groupId) === String(selectedGroup._id)) {
        set({ messages: [...get().messages, newMessage] });
      } else {
        // update group lastMessage and move to top, increment unreadCount if present
        const groups = get().groups || [];
        const idx = groups.findIndex((g) => String(g._id) === String(newMessage.groupId));
        if (idx !== -1) {
          const group = groups[idx];
          const updatedGroup = {
            ...group,
            lastMessage: newMessage,
            unreadCount: (group.unreadCount || 0) + 1,
          };
          const newGroups = [updatedGroup, ...groups.slice(0, idx), ...groups.slice(idx + 1)];
          set({ groups: newGroups });
        } else {
          get().getGroups();
        }
      }
    });

    // handle read receipts: when someone reads messages you sent
    socket.on("message:read", (payload) => {
      // payload: { readerId, messageIds }
      const { messageIds, readerId } = payload || {};
      if (!messageIds || messageIds.length === 0) return;

      // mark messages as read in store
      const updatedMessages = get().messages.map((m) =>
        messageIds.includes(m._id) ? { ...m, isRead: true } : m
      );
      set({ messages: updatedMessages });

      // update users list lastMessage if it matches
      const users = get().users || [];
      const idx = users.findIndex((u) => String(u._id) === String(readerId));
      if (idx !== -1) {
        const user = users[idx];
        const updatedUser = { ...user };
        if (updatedUser.lastMessage && messageIds.includes(updatedUser.lastMessage._id)) {
          updatedUser.lastMessage = { ...updatedUser.lastMessage, isRead: true };
        }
        const newUsers = [...users];
        newUsers[idx] = updatedUser;
        set({ users: newUsers });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    // clear unread count for the selected user locally
    const users = get().users || [];
    const idx = users.findIndex((u) => String(u._id) === String(selectedUser._id));
    if (idx !== -1) {
      const user = users[idx];
      const updatedUser = { ...user, unreadCount: 0 };
      const newUsers = [...users];
      newUsers[idx] = updatedUser;
      set({ users: newUsers });
    }
    // clear any selected group when selecting a user
    set({ selectedUser, selectedGroup: null });
    // record as active chat
    if (selectedUser) {
      get().pushActiveChat({ type: 'user', id: selectedUser._id, meta: { fullName: selectedUser.fullName, profilePic: selectedUser.profilePic } });
  try { localStorage.setItem('selectedUser', JSON.stringify(selectedUser)); } catch { console.warn('persist selectedUser failed'); }
  try { localStorage.removeItem('selectedGroup'); } catch { console.warn('remove selectedGroup failed'); }
    }
  },
  
  setSelectedGroup: (group) => {
    // clear selectedUser when selecting a group
    set({ selectedGroup: group, selectedUser: null });
    // join group room via socket
    const socket = useAuthStore.getState().socket;
    try {
      if (socket && group && group._id) {
        socket.emit("joinGroup", { groupId: group._id });
      }
    } catch (err) {
      console.error("Failed to join group socket room", err);
    }
    // load group messages
    if (group && group._id) {
      get().getGroupMessages(group._id);
    }
    if (group) {
      get().pushActiveChat({ type: 'group', id: group._id, meta: { name: group.name, photo: group.photo } });
  try { localStorage.setItem('selectedGroup', JSON.stringify(group)); } catch { console.warn('persist selectedGroup failed'); }
  try { localStorage.removeItem('selectedUser'); } catch { console.warn('remove selectedUser failed'); }
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      const messages = get().messages.map((msg) =>
        msg._id === messageId ? { ...msg, isDeleted: true, text: "This message was deleted", image: null } : msg
      );
      set({ messages });
      toast.success("Message deleted");
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to delete message";
      toast.error(msg);
    }
  },

  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}/edit`, { text: newText });
      const messages = get().messages.map((msg) =>
        msg._id === messageId ? { ...msg, text: newText, isEdited: true } : msg
      );
      set({ messages });
      toast.success("Message edited");
      return res.data;
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to edit message";
      toast.error(msg);
    }
  },

  starMessage: async (messageId) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}/star`);
      const messages = get().messages.map((msg) =>
        msg._id === messageId ? { ...msg, isStarred: res.data.isStarred } : msg
      );
      set({ messages });
      toast.success(res.data.isStarred ? "Message starred" : "Message unstarred");
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to star message";
      toast.error(msg);
    }
  },

  pinMessage: async (messageId) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}/pin`);
      const messages = get().messages.map((msg) =>
        msg._id === messageId ? { ...msg, isPinned: res.data.isPinned } : msg
      );
      set({ messages });
      toast.success(res.data.isPinned ? "Message pinned" : "Message unpinned");
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Failed to pin message";
      toast.error(msg);
    }
  },
}));

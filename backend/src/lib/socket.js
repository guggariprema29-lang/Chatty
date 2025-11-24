import { Server } from "socket.io";
import http from "http";
import express from "express";
// PublicMessage model and public-room handlers removed when public chat feature was disabled

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // typing events: for 1:1 chats we forward typing events to the receiver's socket
  socket.on("typing:start", ({ receiverId }) => {
    try {
      if (!receiverId) return;
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId });
      }
    } catch (err) {
      console.error("typing:start error", err);
    }
  });

  socket.on("typing:stop", ({ receiverId }) => {
    try {
      if (!receiverId) return;
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:stop", { senderId: userId });
      }
    } catch (err) {
      console.error("typing:stop error", err);
    }
  });

  // join/leave group rooms
  socket.on("joinGroup", ({ groupId }) => {
    try {
      if (!groupId) return;
      socket.join(`group:${groupId}`);
    } catch (err) {
      console.error("joinGroup error", err);
    }
  });

  socket.on("leaveGroup", ({ groupId }) => {
    try {
      if (!groupId) return;
      socket.leave(`group:${groupId}`);
    } catch (err) {
      console.error("leaveGroup error", err);
    }
  });

  // public room join/leave
  // public chat handlers removed
});

export { io, app, server };

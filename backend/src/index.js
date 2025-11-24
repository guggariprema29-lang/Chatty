import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import feedbackRoutes from "./routes/feedback.route.js";
import reminderRoutes from "./routes/reminder.route.js";
import themeRoutes from "./routes/theme.route.js";
import gameRoutes from "./routes/game.route.js";
import focusModeRoutes from "./routes/focusMode.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // allow common local dev hosts (any port)
      try {
        const url = new URL(origin);
        const hostname = url.hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
          return callback(null, true);
        }
      } catch (err) {
        // fallthrough to explicit check
      }

      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: This origin is not allowed."), false);
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/feedback", feedbackRoutes);
// poll routes removed
app.use("/api/reminders", reminderRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/focus-mode", focusModeRoutes);
app.use("/api/focus-mode", focusModeRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

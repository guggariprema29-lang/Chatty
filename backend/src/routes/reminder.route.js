import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReminder,
  getMyReminders,
  getUpcomingReminders,
  completeReminder,
  deleteReminder,
} from "../controllers/reminder.controller.js";

const router = express.Router();

router.post("/", protectRoute, createReminder);
router.get("/", protectRoute, getMyReminders);
router.get("/upcoming", protectRoute, getUpcomingReminders);
router.patch("/:id/complete", protectRoute, completeReminder);
router.delete("/:id", protectRoute, deleteReminder);

export default router;

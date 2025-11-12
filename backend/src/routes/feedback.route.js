import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFeedback,
  getMyFeedback,
  getUnreadCount,
  canSendFeedback,
  deleteFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendFeedback);
router.get("/my-feedback", protectRoute, getMyFeedback);
router.get("/unread-count", protectRoute, getUnreadCount);
router.get("/can-send/:recipientId", protectRoute, canSendFeedback);
router.delete("/:id", protectRoute, deleteFeedback);

export default router;

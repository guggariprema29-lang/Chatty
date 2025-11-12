import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createPoll,
  getPollsForChat,
  voteOnPoll,
  closePoll,
  deletePoll,
} from "../controllers/poll.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createPoll);
router.get("/chat/:chatId", protectRoute, getPollsForChat);
router.post("/:pollId/vote", protectRoute, voteOnPoll);
router.put("/:pollId/close", protectRoute, closePoll);
router.delete("/:pollId", protectRoute, deletePoll);

export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGame,
  makeMove,
  getActiveGames,
  endGame,
} from "../controllers/game.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGame);
router.post("/:gameId/move", protectRoute, makeMove);
router.get("/chat/:chatId/active", protectRoute, getActiveGames);
router.put("/:gameId/end", protectRoute, endGame);

export default router;

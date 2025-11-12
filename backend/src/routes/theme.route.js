import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  saveTheme,
  getTheme,
  getAllThemes,
} from "../controllers/theme.controller.js";

const router = express.Router();

router.post("/", protectRoute, saveTheme);
router.get("/all", protectRoute, getAllThemes);
router.get("/:chatId/:chatType", protectRoute, getTheme);

export default router;

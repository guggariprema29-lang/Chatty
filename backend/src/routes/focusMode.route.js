import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getFocusMode,
  updateFocusMode,
  toggleFocusMode,
  deleteFocusMode,
} from "../controllers/focusMode.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFocusMode);
router.put("/", protectRoute, updateFocusMode);
router.post("/toggle", protectRoute, toggleFocusMode);
router.delete("/", protectRoute, deleteFocusMode);

export default router;

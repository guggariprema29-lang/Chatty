import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, sendGroupMessage, getGroupMessages, deleteMessage, editMessage, starMessage, pinMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
// group route must come before the generic /:id route
router.get("/group/:id", protectRoute, getGroupMessages);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/send-group/:id", protectRoute, sendGroupMessage);

router.delete("/:id", protectRoute, deleteMessage);
router.put("/:id/edit", protectRoute, editMessage);
router.put("/:id/star", protectRoute, starMessage);
router.put("/:id/pin", protectRoute, pinMessage);

export default router;

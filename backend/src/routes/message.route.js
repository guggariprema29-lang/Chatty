import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, sendGroupMessage, getGroupMessages, deleteMessage, editMessage, starMessage, pinMessage, generateChatSummary, deleteMessageForEveryone, undoDeleteMessage, adminDeleteMessage, toggleDisappearing } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
// group route must come before the generic /:id route
router.get("/group/:id", protectRoute, getGroupMessages);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/send-group/:id", protectRoute, sendGroupMessage);

// generate chat summary for user or group within a date range
router.post("/summary", protectRoute, generateChatSummary);

router.delete("/:id", protectRoute, deleteMessage);
// delete for everyone
router.put("/:id/delete-everyone", protectRoute, deleteMessageForEveryone);
// undo delete
router.put("/:id/undo", protectRoute, undoDeleteMessage);
// admin delete (groups)
router.put("/:id/admin-delete", protectRoute, adminDeleteMessage);
// toggle disappearing
router.put("/:id/toggle-disappearing", protectRoute, toggleDisappearing);
router.put("/:id/edit", protectRoute, editMessage);
router.put("/:id/star", protectRoute, starMessage);
router.put("/:id/pin", protectRoute, pinMessage);

export default router;

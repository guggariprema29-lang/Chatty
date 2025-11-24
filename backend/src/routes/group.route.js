import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getGroupsForUser,
  addMember,
  removeMember,
  updateGroup,
  leaveGroup,
  toggleBlockGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroupsForUser);
router.post("/:id/members", protectRoute, addMember);
router.delete("/:id/members/:memberId", protectRoute, removeMember);
router.put("/:id", protectRoute, updateGroup);
// leave group (self)
router.post("/:id/leave", protectRoute, leaveGroup);
// block/unblock group for current user
router.put("/:id/block", protectRoute, toggleBlockGroup);

export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getGroupsForUser,
  addMember,
  removeMember,
  updateGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroupsForUser);
router.post("/:id/members", protectRoute, addMember);
router.delete("/:id/members/:memberId", protectRoute, removeMember);
router.put("/:id", protectRoute, updateGroup);

export default router;

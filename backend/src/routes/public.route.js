import express from "express";
import { getPublicMessages, createPublicMessage } from "../controllers/public.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// public messages: anyone can GET, authenticated users can POST (optional)
router.get("/messages", getPublicMessages);
router.post("/messages", protectRoute, createPublicMessage);

export default router;

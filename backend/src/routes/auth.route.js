import express from "express";
import { checkAuth, login, logout, signup, updateProfile, getBellSoundPreferences, updateBellSoundPreferences, getAvailableBellSounds, toggleArchiveChat, toggleHideChat } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

// Bell sound preference routes
router.get("/bell-sounds/available", protectRoute, getAvailableBellSounds);
router.get("/bell-sounds/preferences", protectRoute, getBellSoundPreferences);
router.put("/bell-sounds/preferences", protectRoute, updateBellSoundPreferences);
// Archive/Hide chat endpoints
router.put("/chat/archive", protectRoute, toggleArchiveChat);
router.put("/chat/hide", protectRoute, toggleHideChat);

// debug: return current authenticated user (development helper)
router.get("/debug/me", protectRoute, (req, res) => {
	try {
		const user = req.user;
		res.status(200).json({ user: { _id: user._id, email: user.email, fullName: user.fullName } });
	} catch (err) {
		console.error("/debug/me error", err);
		res.status(500).json({ message: "debug error" });
	}
});

export default router;

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { dbConnected } from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers?.authorization?.split(" ")?.[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verify failed:", err && err.message ? err.message : err);
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token Payload" });
    }

    if (!dbConnected) {
      console.error("protectRoute: DB not connected");
      return res.status(503).json({ message: "Service unavailable - database not connected" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// backward-compatible alias: some modules import `authMiddleware`
export const authMiddleware = protectRoute;

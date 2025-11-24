import mongoose from "mongoose";

// exported flag to indicate if DB is connected
export let dbConnected = false;

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

const connectWithRetry = async (retries = MAX_RETRIES) => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in environment variables");
      return null;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10s
      socketTimeoutMS: 45000,
      // try prefer IPv4 for networks with IPv6 issues
      family: 4,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    dbConnected = true;
    return conn;
  } catch (error) {
    console.error(`MongoDB connect attempt failed (${MAX_RETRIES - retries + 1}):`, error && error.message ? error.message : error);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    } else {
      console.error("MongoDB connection failed after retries:", error);
      console.error("Make sure MongoDB is running, your network allows access to Atlas, or check your MONGODB_URI in .env");

      // Optional local fallback for development
      if (process.env.NODE_ENV === "development") {
        try {
          const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/chatty";
          console.log("Attempting fallback to local MongoDB at:", localUri);
          const localConn = await mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
          });
          console.log(`Fallback MongoDB connected: ${localConn.connection.host}`);
          dbConnected = true;
          return localConn;
        } catch (localErr) {
          console.error("Fallback local MongoDB connection failed:", localErr);
        }
      }

      // Don't throw — let the server continue running but indicate disconnected
      dbConnected = false;
      return null;
    }
  }
};

export const connectDB = async () => {
  // Connect in background, don't block server startup
  connectWithRetry().catch(() => {
    // Already handled in connectWithRetry
  });
};

import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const connectWithRetry = async (retries = MAX_RETRIES) => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in environment variables");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (retries > 0) {
      // Silently retry, only log on final failure
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    } else {
      console.error("MongoDB connection failed after retries:", error.message);
      console.error("Make sure MongoDB is running or check your MONGODB_URI in .env");
      console.error("To start MongoDB: mongod (or use MongoDB Atlas)");
      // Don't throw - let the server continue running
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

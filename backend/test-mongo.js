import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // these options are safe for modern drivers
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongo connected:', conn.connection.host);
    process.exit(0);
  } catch (err) {
    console.error('connect error:', err);
    process.exit(1);
  }
})();
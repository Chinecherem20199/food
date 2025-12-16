import mongoose from "mongoose";

const mongoKeepAlive = () => {
  setInterval(async () => {
    if (mongoose.connection.readyState !== 1) return;

    try {
      await mongoose.connection.db.admin().ping();
      console.log("MongoDB ping OK");
    } catch (err) {
      console.error("MongoDB ping failed:", err.message);
    }
  }, 1000 * 60 * 5); // every 5 minutes
};

export default mongoKeepAlive;
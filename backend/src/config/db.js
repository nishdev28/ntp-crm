import mongoose from "mongoose";

const connectDB = async () => {
  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error("MONGO_URI is not defined in the environment variables");
  }

  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(url, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");
  return conn;
};
export default connectDB;
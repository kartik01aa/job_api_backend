import mongoose from "mongoose";

export const connectDB = (url: string) => {
  console.log("Wait for database connection");
  return mongoose.connect(url);
};

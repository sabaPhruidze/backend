import mongoose from "mongoose";
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in environment variables");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`connected succesfully ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
};
export default connectDB;

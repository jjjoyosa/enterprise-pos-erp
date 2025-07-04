import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/enterprise-pos');
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[DB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};
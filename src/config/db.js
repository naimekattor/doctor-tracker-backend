import mongoose from 'mongoose';

const connectDB = async (retries = 5, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
      });

      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      console.warn(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('All MongoDB connection attempts exhausted.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default connectDB;
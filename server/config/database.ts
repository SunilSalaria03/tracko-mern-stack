import { DatabaseConfig } from '../helpers/commonInterfaces';
import mongoose from 'mongoose';

const databaseConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tracko_db',
  options: {}
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default databaseConfig; 
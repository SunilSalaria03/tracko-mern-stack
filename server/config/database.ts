import mongoose from 'mongoose';

import { DatabaseConfig } from '../interfaces/commonInterfaces';

const databaseConfig: DatabaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tracko_db',
  options: {}
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default databaseConfig; 
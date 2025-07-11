"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const databaseConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tracko_db',
    options: {}
};
const connectDatabase = async () => {
    try {
        const conn = await mongoose_1.default.connect(databaseConfig.uri, databaseConfig.options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
exports.default = databaseConfig;
//# sourceMappingURL=database.js.map
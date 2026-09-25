import mongoose from 'mongoose';

export default async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error('Missing MONGODB_URI in environment variables');
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        mongoose.connection.on('error', (err) => {
            console.error('Runtime MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected! Attempting to reconnect automatically...');
        });

        return conn;
    } catch (error) {
        console.error('Initial MongoDB connection error:', error.message);
        throw error;
    }
}
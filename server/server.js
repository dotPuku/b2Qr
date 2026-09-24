import { getPrefix, addPrefix, deletePrefix } from './controller.js';
import express from 'express';
import cors from 'cors';
import connectDB from './connectDB.js';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(express.json());

app.route('/').get(getPrefix).post(addPrefix);
app.route('/delete').post(deletePrefix);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

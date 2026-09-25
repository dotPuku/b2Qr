import { getPrefix, addPrefix, deletePrefix } from './controller.js';
import express from 'express';
import cors from 'cors';
import connectDB from './connectDB.js';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    const normalizedOrigin = origin.replace(/\/$/, '');
    return allowedOrigins.some((allowed) => allowed === normalizedOrigin);
};

app.use(
    cors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin) || allowedOrigins.length === 0) {
                callback(null, true);
                return;
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }

    next();
});

app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, status: 'ok' });
});

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

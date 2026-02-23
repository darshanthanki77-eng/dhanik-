require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
const allowedOrigins = [
    'https://dhanki.vercel.app',
    'https://dhanik.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());
app.use(express.json());

// Serve uploaded proof screenshots
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect DB before handling requests (lazy, cached connection)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/token', require('./routes/tokenRoutes'));
app.use('/api/referral', require('./routes/referralRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.send('DHANKI API is running...');
});

// Debug health check endpoint
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    res.json({
        status: 'ok',
        mongo_uri_set: !!process.env.MONGO_URI,
        jwt_secret_set: !!process.env.JWT_SECRET,
        db_state: mongoose.connection.readyState, // 0=disconnected, 1=connected
        env: process.env.NODE_ENV || 'not set'
    });
});

// Start the server if not imported (local dev only)
if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware để log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
        headers: req.headers,
        body: req.body
    });
    next();
});

// CORS middleware
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://xaxn.netlify.app',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://xaxn.netlify.app',
            'http://127.0.0.1:5500',
            'http://localhost:5500'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const matchRoutes = require('./routes/match');
const messageRoutes = require('./routes/message');
const matchingRoutes = require('./routes/matching');
const videoCallRoutes = require('./routes/videoCall');

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/video-call', videoCallRoutes);

// Socket.IO setup
const io = socketIO(server, {
    cors: {
        origin: 'https://xaxn.netlify.app',
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.io connection handling
require('./socket/videoCall')(io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
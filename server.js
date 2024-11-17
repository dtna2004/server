const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Cấu hình CORS
app.use(cors({
    origin: ['https://xaxn.netlify.app', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204
}));

// Thêm middleware để xử lý OPTIONS request
app.options('*', cors());

// Cấu hình Socket.IO
const io = socketIO(server, {
    cors: {
        origin: ['https://xaxn.netlify.app', 'http://localhost:5500'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const matchRoutes = require('./routes/match');
const messageRoutes = require('./routes/message');
const matchingRoutes = require('./routes/matching');
const videoCallRoutes = require('./routes/videoCall');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/video-call', videoCallRoutes);

// Socket.io connection handling
require('./socket/videoCall')(io);

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Database connection với options
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây
    socketTimeoutMS: 45000, // Timeout sau 45 giây
    family: 4 // Sử dụng IPv4
})
.then(() => {
    console.log('Connected to MongoDB');
    // Chỉ start server sau khi đã kết nối database thành công
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
}); 

// Thêm vào cuối server.js
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Lỗi server', error: err.message });
});
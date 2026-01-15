const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zoomerrrrlive')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/calls', require('./routes/calls'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/scheduler', require('./routes/scheduler'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));


app.get('/', (req, res) => {
    res.send('Zoomerrrrlive API is Running');
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io Server
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*', // Update for production
        methods: ['GET', 'POST']
    }
});
app.set('io', io); // Allow access to io in routes

// Attach Sarvam Socket Handler
const sarvamSocketHandler = require('./sockets/sarvamHandler');

io.on('connection', (socket) => {
    console.log(`✅ Socket.io client connected: ${socket.id}`);

    // Attach the sarvam handler for this socket
    sarvamSocketHandler(io, socket);

    socket.on('disconnect', () => {
        console.log(`❌ Socket.io client disconnected: ${socket.id}`);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

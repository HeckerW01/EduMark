/**
 * EduMark Server
 * Main application server for the EduMark educational platform
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const logger = require('./utils/logger');
const { setupMiddleware } = require('./middleware/setup');
const { initializeDatabase } = require('./config/database');
const { initializeAI } = require('./services/ai-service');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const learningTaskRoutes = require('./routes/learning-tasks');
const academicWorkRoutes = require('./routes/academic-work');
const documentRoutes = require('./routes/documents');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    logger.info('New WebSocket connection established');
    
    // Handle authentication
    const token = req.url.split('token=')[1];
    if (!token) {
        ws.close(1008, 'Authentication required');
        return;
    }
    
    // Store user session
    ws.userId = token;
    
    // Handle messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Handle different message types
            switch (data.type) {
                case 'join_session':
                    handleJoinSession(ws, data);
                    break;
                case 'leave_session':
                    handleLeaveSession(ws, data);
                    break;
                case 'annotation':
                    handleAnnotation(ws, data);
                    break;
                case 'chat':
                    handleChat(ws, data);
                    break;
                default:
                    logger.warn(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            logger.error('WebSocket message error:', error);
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        handleDisconnection(ws);
    });
});

// WebSocket message handlers
function handleJoinSession(ws, data) {
    const { sessionId } = data;
    ws.sessionId = sessionId;
    ws.join(sessionId);
    logger.info(`User ${ws.userId} joined session ${sessionId}`);
}

function handleLeaveSession(ws, data) {
    const { sessionId } = data;
    ws.leave(sessionId);
    ws.sessionId = null;
    logger.info(`User ${ws.userId} left session ${data.sessionId}`);
}

function handleAnnotation(ws, data) {
    if (!ws.sessionId) return;
    
    // Broadcast annotation to all users in the session
    wss.to(ws.sessionId).forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'annotation',
                userId: ws.userId,
                data: data.annotation
            }));
        }
    });
}

function handleChat(ws, data) {
    if (!ws.sessionId) return;
    
    // Broadcast chat message to all users in the session
    wss.to(ws.sessionId).forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'chat',
                userId: ws.userId,
                message: data.message,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

function handleDisconnection(ws) {
    if (ws.sessionId) {
        ws.leave(ws.sessionId);
        logger.info(`User ${ws.userId} disconnected from session ${ws.sessionId}`);
    }
}

// Initialize Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
});

// Initialize session store
const sessionStore = new RedisStore({ client: redisClient });

// Setup middleware
setupMiddleware(app);

// Configure session
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", 'ws:', 'wss:']
        }
    }
}));

// Compression middleware
app.use(compression());

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learning-tasks', learningTaskRoutes);
app.use('/api/academic-work', academicWorkRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Add after other API routes
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }
        const { generateAIResponse } = require('./services/ai-service');
        const response = await generateAIResponse(message);
        res.json({ response });
    } catch (error) {
        logger.error('AI chat endpoint error:', error);
        res.status(500).json({ error: 'Failed to get response from EduMarkAI.' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Initialize services
async function initializeServices() {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Initialize AI service
        await initializeAI();
        
        // Connect to Redis
        await redisClient.connect();
        
        logger.info('All services initialized successfully');
    } catch (error) {
        logger.error('Service initialization error:', error);
        process.exit(1);
    }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    await initializeServices();
    logger.info(`EduMark server running on port ${PORT}`);
});
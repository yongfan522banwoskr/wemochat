const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Ensure data directory exists
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR, { recursive: true });
}

// Init stores (will be injected into services)
const userStore = require('./store/userStore')(config.DATA_DIR);
const messageStore = require('./store/messageStore')(config.DATA_DIR);
const friendStore = require('./store/friendStore')(config.DATA_DIR);
const sessionStore = require('./store/sessionStore')();

// Init services
const authService = require('./services/authService')(userStore, sessionStore);
const userService = require('./services/userService')(userStore);
const friendService = require('./services/friendService')(friendStore, userStore);
const messageService = require('./services/messageService')(messageStore);

// Init auth middleware
const authMiddleware = require('./middleware/auth')(sessionStore);

// Init routes
const authRoutes = require('./routes/auth')(authService);
const userRoutes = require('./routes/users')(userService);
const friendRoutes = require('./routes/friends')(friendService, messageService);

// Create Express + HTTP server
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

// REST routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/friends', authMiddleware, friendRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ code: 0, message: 'ok' }));

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
const chatHandler = require('./ws/chatHandler')(wss, sessionStore, messageService, friendService, userService);

server.listen(config.PORT, () => {
  console.log(`[Wemochat] Server running on http://localhost:${config.PORT}`);
  console.log(`[Wemochat] WebSocket path: /ws`);
});

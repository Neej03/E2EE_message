import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { registerSocketHandlers } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*', // Production: restrict to client domain
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Version 1 Router
app.use('/api/v1', apiRouter);

// Healthcheck Route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CipherPulse E2EE Backend Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO Server Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🔐 CipherPulse E2EE Backend Running on Port ${PORT}`);
  console.log(`📡 Socket.IO Realtime Gateway initialized`);
  console.log(`🛡️  Zero-Knowledge Ciphertext Persistence active`);
  console.log(`====================================================`);
});

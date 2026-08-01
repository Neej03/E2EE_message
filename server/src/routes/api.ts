import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth';
import { register, login, oauthLogin, getMe, logout } from '../controllers/authController';
import { uploadKeyBundle, getKeyBundle } from '../controllers/keyController';
import { getConversations, createConversation } from '../controllers/conversationController';
import { getMessages, sendMessage, toggleReaction, deleteMessage } from '../controllers/messageController';
import { askAiAssistant, getSmartReplies, summarizeConversation } from '../controllers/aiController';
import { getSubscription, createCheckoutSession } from '../controllers/stripeController';
import { getAdminMetrics, getAuditLogs, getAllUsersAdmin, updateUserRole } from '../controllers/adminController';

const router = Router();

// Auth Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/oauth', oauthLogin);
router.get('/auth/me', authenticateJwt, getMe);
router.post('/auth/logout', authenticateJwt, logout);

// E2EE Key Exchange Endpoints
router.post('/keys/upload', authenticateJwt, uploadKeyBundle);
router.get('/keys/bundle/:userId', authenticateJwt, getKeyBundle);

// Conversations & Channels
router.get('/conversations', authenticateJwt, getConversations);
router.post('/conversations', authenticateJwt, createConversation);

// Messages (Ciphertext Store)
router.get('/messages/:conversationId', authenticateJwt, getMessages);
router.post('/messages', authenticateJwt, sendMessage);
router.post('/messages/reaction', authenticateJwt, toggleReaction);
router.delete('/messages', authenticateJwt, deleteMessage);

// AI Assistant
router.post('/ai/chat', authenticateJwt, askAiAssistant);
router.post('/ai/smart-replies', authenticateJwt, getSmartReplies);
router.get('/ai/summary/:conversationId', authenticateJwt, summarizeConversation);

// SaaS Billing & Subscriptions
router.get('/billing/subscription', authenticateJwt, getSubscription);
router.post('/billing/checkout', authenticateJwt, createCheckoutSession);

// Admin Control Center & Audit
router.get('/admin/metrics', authenticateJwt, getAdminMetrics);
router.get('/admin/audit-logs', authenticateJwt, getAuditLogs);
router.get('/admin/users', authenticateJwt, getAllUsersAdmin);
router.patch('/admin/users/role', authenticateJwt, updateUserRole);

export default router;

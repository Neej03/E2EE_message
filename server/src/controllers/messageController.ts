import { Request, Response } from 'express';
import { messagesStore, usersStore, conversationsStore, logSecurityEvent, MessageRecord } from '../store/inMemoryStore';

export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const list = messagesStore.get(conversationId) || [];
  return res.json(list);
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const deviceId = (req as any).user?.deviceId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { conversationId, messageType, ciphertext, iv, authTag, ephemeralPublicKey, disappearingDuration, replyToMessageId } = req.body;
    if (!conversationId || !ciphertext || !iv) {
      return res.status(400).json({ error: 'conversationId, ciphertext, and iv are required' });
    }

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: MessageRecord = {
      id: msgId,
      conversationId,
      senderId: userId,
      senderDeviceId: deviceId,
      messageType: messageType || 'TEXT',
      ciphertext,
      iv,
      authTag,
      ephemeralPublicKey,
      disappearingDuration: disappearingDuration || 0,
      replyToMessageId,
      reactions: [],
      createdAt: new Date().toISOString()
    };

    let convMsgs = messagesStore.get(conversationId);
    if (!convMsgs) {
      convMsgs = [];
      messagesStore.set(conversationId, convMsgs);
    }
    convMsgs.push(newMsg);

    // Update conversation timestamp
    const conv = conversationsStore.get(conversationId);
    if (conv) conv.updatedAt = new Date().toISOString();

    logSecurityEvent(userId, 'E2EE_MESSAGE_SENT', { msgId, conversationId, messageType: newMsg.messageType });
    return res.status(201).json(newMsg);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Send message error' });
  }
};

export const toggleReaction = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { messageId, conversationId, emoji } = req.body;
  const msgs = messagesStore.get(conversationId);
  if (!msgs) return res.status(404).json({ error: 'Conversation messages not found' });

  const msg = msgs.find(m => m.id === messageId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  if (!msg.reactions) msg.reactions = [];
  const existingIdx = msg.reactions.findIndex(r => r.userId === userId && r.emoji === emoji);

  if (existingIdx >= 0) {
    msg.reactions.splice(existingIdx, 1);
  } else {
    msg.reactions.push({
      id: `r_${Date.now()}`,
      userId,
      emoji
    });
  }

  return res.json({ success: true, reactions: msg.reactions });
};

export const deleteMessage = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { messageId, conversationId, deleteForEveryone } = req.body;

  const msgs = messagesStore.get(conversationId);
  if (!msgs) return res.status(404).json({ error: 'Message array not found' });

  const idx = msgs.findIndex(m => m.id === messageId);
  if (idx < 0) return res.status(404).json({ error: 'Message not found' });

  const msg = msgs[idx];
  if (deleteForEveryone) {
    if (msg.senderId !== userId) return res.status(403).json({ error: 'Only sender can delete for everyone' });
    msg.isDeleted = true;
    msg.ciphertext = '🔒 Message deleted by sender';
    logSecurityEvent(userId, 'E2EE_MESSAGE_DELETED_EVERYONE', { messageId });
  } else {
    msgs.splice(idx, 1);
    logSecurityEvent(userId, 'E2EE_MESSAGE_DELETED_ME', { messageId });
  }

  return res.json({ success: true, messageId });
};

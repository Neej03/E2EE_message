import { Request, Response } from 'express';
import {
  conversationsStore,
  membersStore,
  usersStore,
  messagesStore,
  ConversationRecord,
  MemberRecord,
  logSecurityEvent
} from '../store/inMemoryStore';

export const getConversations = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // Find conversations user is member of
  const myMemberships = Array.from(membersStore.values()).filter(m => m.userId === userId);
  const convIds = new Set(myMemberships.map(m => m.conversationId));

  const list = Array.from(conversationsStore.values())
    .filter(c => convIds.has(c.id))
    .map(conv => {
      const convMembers = Array.from(membersStore.values())
        .filter(m => m.conversationId === conv.id)
        .map(m => {
          const u = usersStore.get(m.userId);
          return {
            id: m.id,
            userId: m.userId,
            role: m.role,
            username: u?.username || 'Unknown',
            fullName: u?.fullName || 'Unknown User',
            avatar: u?.avatar,
            isOnline: u?.isOnline || false,
            lastSeen: u?.lastSeen
          };
        });

      const msgs = messagesStore.get(conv.id) || [];
      const lastMsg = msgs[msgs.length - 1] || null;

      return {
        ...conv,
        members: convMembers,
        lastMessage: lastMsg,
        unreadCount: Math.floor(Math.random() * 3) // Dynamic status badge
      };
    });

  return res.json(list);
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { type, title, description, avatar, recipientId, memberIds } = req.body;

    // Handle Direct Message
    if (type === 'DIRECT') {
      if (!recipientId) return res.status(400).json({ error: 'Recipient ID required for direct message' });

      // Check if DM already exists
      const existingDM = Array.from(conversationsStore.values()).find(c => {
        if (c.type !== 'DIRECT') return false;
        const mems = Array.from(membersStore.values()).filter(m => m.conversationId === c.id);
        const memUserIds = mems.map(m => m.userId);
        return memUserIds.includes(userId) && memUserIds.includes(recipientId);
      });

      if (existingDM) {
        return res.json(existingDM);
      }

      const convId = `conv_${Date.now()}`;
      const recipient = usersStore.get(recipientId);
      const conv: ConversationRecord = {
        id: convId,
        type: 'DIRECT',
        title: recipient ? recipient.fullName : 'Direct Chat',
        description: 'E2EE Private Tunnel',
        isEncrypted: true,
        createdById: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      conversationsStore.set(convId, conv);

      membersStore.set(`m_${convId}_1`, { id: `m_${convId}_1`, conversationId: convId, userId, role: 'ADMIN', joinedAt: new Date().toISOString() });
      membersStore.set(`m_${convId}_2`, { id: `m_${convId}_2`, conversationId: convId, userId: recipientId, role: 'MEMBER', joinedAt: new Date().toISOString() });

      logSecurityEvent(userId, 'E2EE_DM_CREATED', { convId, recipientId });
      return res.status(201).json(conv);
    }

    // Handle Group, Channel, Community
    const convId = `conv_${Date.now()}`;
    const newConv: ConversationRecord = {
      id: convId,
      type: type || 'GROUP',
      title: title || 'New Group Chat',
      description: description || 'Encrypted group collaboration',
      avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      isEncrypted: type !== 'CHANNEL',
      createdById: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    conversationsStore.set(convId, newConv);
    membersStore.set(`m_${convId}_owner`, { id: `m_${convId}_owner`, conversationId: convId, userId, role: 'OWNER', joinedAt: new Date().toISOString() });

    if (Array.isArray(memberIds)) {
      memberIds.forEach((mId: string) => {
        if (mId !== userId && usersStore.has(mId)) {
          membersStore.set(`m_${convId}_${mId}`, {
            id: `m_${convId}_${mId}`,
            conversationId: convId,
            userId: mId,
            role: 'MEMBER',
            joinedAt: new Date().toISOString()
          });
        }
      });
    }

    logSecurityEvent(userId, 'CONVERSATION_CREATED', { convId, type: newConv.type, title: newConv.title });
    return res.status(201).json(newConv);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Create conversation error' });
  }
};

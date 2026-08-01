import { Server as SocketIOServer, Socket } from 'socket.io';
import { usersStore, messagesStore, MessageRecord, logSecurityEvent } from '../store/inMemoryStore';

export const registerSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string || 'usr_alice';
    const deviceId = socket.handshake.query.deviceId as string || 'dev_alice_1';

    // Update presence
    const user = usersStore.get(userId);
    if (user) {
      user.isOnline = true;
      user.lastSeen = new Date().toISOString();
      io.emit('user_presence_changed', { userId, isOnline: true, lastSeen: user.lastSeen });
    }

    socket.join(`user_${userId}`);

    // Join conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conv_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conv_${conversationId}`);
    });

    // Real-Time E2EE Message Send Event
    socket.on('send_e2ee_message', (data: {
      conversationId: string;
      messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'VOICE_NOTE' | 'POLL';
      ciphertext: string;
      iv: string;
      authTag?: string;
      ephemeralPublicKey?: string;
      disappearingDuration?: number;
      replyToMessageId?: string;
    }) => {
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newMsg: MessageRecord = {
        id: msgId,
        conversationId: data.conversationId,
        senderId: userId,
        senderDeviceId: deviceId,
        messageType: data.messageType || 'TEXT',
        ciphertext: data.ciphertext,
        iv: data.iv,
        authTag: data.authTag,
        ephemeralPublicKey: data.ephemeralPublicKey,
        disappearingDuration: data.disappearingDuration || 0,
        replyToMessageId: data.replyToMessageId,
        reactions: [],
        createdAt: new Date().toISOString()
      };

      let msgs = messagesStore.get(data.conversationId);
      if (!msgs) {
        msgs = [];
        messagesStore.set(data.conversationId, msgs);
      }
      msgs.push(newMsg);

      // Broadcast to room
      io.to(`conv_${data.conversationId}`).emit('new_e2ee_message', newMsg);
      logSecurityEvent(userId, 'SOCKET_E2EE_MESSAGE_RELAYED', { msgId, convId: data.conversationId });
    });

    // Typing Indicators
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing_start', { conversationId, userId });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing_stop', { conversationId, userId });
    });

    // WebRTC Signaling Relay
    socket.on('call_offer', ({ targetUserId, conversationId, sdpOffer, type }: any) => {
      socket.to(`user_${targetUserId}`).emit('call_offer_received', {
        initiatorId: userId,
        conversationId,
        sdpOffer,
        type: type || 'VIDEO'
      });
    });

    socket.on('call_answer', ({ targetUserId, sdpAnswer }: any) => {
      socket.to(`user_${targetUserId}`).emit('call_answer_received', {
        responderId: userId,
        sdpAnswer
      });
    });

    socket.on('call_ice_candidate', ({ targetUserId, candidate }: any) => {
      socket.to(`user_${targetUserId}`).emit('call_ice_candidate_received', {
        senderId: userId,
        candidate
      });
    });

    socket.on('call_end', ({ targetUserId, conversationId }: any) => {
      if (targetUserId) {
        socket.to(`user_${targetUserId}`).emit('call_ended', { conversationId, endedBy: userId });
      } else if (conversationId) {
        socket.to(`conv_${conversationId}`).emit('call_ended', { conversationId, endedBy: userId });
      }
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date().toISOString();
        io.emit('user_presence_changed', { userId, isOnline: false, lastSeen: user.lastSeen });
      }
    });
  });
};

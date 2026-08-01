import { Server, Socket } from 'socket.io';
import { logSecurityEvent } from '../store/inMemoryStore';

export const setupSocketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string || 'anonymous_user';
    const deviceId = socket.handshake.query.deviceId as string || 'dev_1';

    console.log(`📡 Socket Connected: User ${userId} (Device: ${deviceId}, SocketID: ${socket.id})`);

    // Join user's personal channel
    socket.join(userId);

    // Join custom shareable room
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`👥 User ${userId} joined room ${roomId}`);
      socket.to(roomId).emit('peer_joined', { userId, deviceId, timestamp: new Date().toISOString() });
    });

    // Handle E2EE Ciphertext Message Relay
    socket.on('new_e2ee_message', (data: {
      conversationId: string;
      messageId: string;
      senderId: string;
      ciphertext: string;
      iv: string;
      ephemeralPublicKey?: string;
      messageType?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: string;
    }) => {
      console.log(`🔒 E2EE Message Relay in ${data.conversationId} from ${data.senderId}`);
      
      // Relay to all sockets in the conversation room
      io.to(data.conversationId).emit('receive_e2ee_message', data);
      socket.broadcast.emit('receive_e2ee_message', data);

      logSecurityEvent(userId, 'CIPHERTEXT_RELAYED', {
        conversationId: data.conversationId,
        messageId: data.messageId
      });
    });

    // Handle WebRTC Call Signaling (Video & Voice)
    socket.on('call_offer', (data: { toUserId: string; offer: any; callType: string; conversationId: string }) => {
      socket.to(data.toUserId).emit('incoming_call_offer', {
        fromUserId: userId,
        offer: data.offer,
        callType: data.callType,
        conversationId: data.conversationId
      });
      socket.broadcast.emit('incoming_call_offer', {
        fromUserId: userId,
        offer: data.offer,
        callType: data.callType,
        conversationId: data.conversationId
      });
    });

    socket.on('call_answer', (data: { toUserId: string; answer: any; conversationId: string }) => {
      socket.to(data.toUserId).emit('call_answered', {
        fromUserId: userId,
        answer: data.answer,
        conversationId: data.conversationId
      });
      socket.broadcast.emit('call_answered', {
        fromUserId: userId,
        answer: data.answer,
        conversationId: data.conversationId
      });
    });

    socket.on('call_ice_candidate', (data: { toUserId: string; candidate: any }) => {
      socket.to(data.toUserId).emit('remote_ice_candidate', {
        fromUserId: userId,
        candidate: data.candidate
      });
      socket.broadcast.emit('remote_ice_candidate', {
        fromUserId: userId,
        candidate: data.candidate
      });
    });

    socket.on('call_end', (data: { conversationId: string }) => {
      io.to(data.conversationId).emit('call_ended', { fromUserId: userId });
      socket.broadcast.emit('call_ended', { fromUserId: userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket Disconnected: ${socket.id} (User: ${userId})`);
    });
  });
};

export const registerSocketHandlers = setupSocketHandler;

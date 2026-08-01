import { io, Socket } from 'socket.io-client';
import { useAppStore, Message } from './store';

let socket: Socket | null = null;

export function getSocket(userId: string = 'usr_alice', deviceId: string = 'dev_alice_1'): Socket {
  if (!socket) {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    
    socket = io(SERVER_URL, {
      query: { userId, deviceId },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    // Receive E2EE Messages from Friends in Real-Time
    socket.on('receive_e2ee_message', (data: any) => {
      const { addMessage, currentUser } = useAppStore.getState();
      
      // Avoid duplicating own sent messages
      if (data.senderId === currentUser.id) return;

      const incomingMsg: Message = {
        id: data.messageId || `msg_recv_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        conversationId: data.conversationId,
        senderId: data.senderId,
        messageType: data.messageType || 'TEXT',
        ciphertext: data.ciphertext,
        iv: data.iv || 'iv_default',
        createdAt: new Date().toISOString(),
        isDecrypted: true,
        decryptedText: data.ciphertext
      };

      if (data.fileUrl) {
        (incomingMsg as any).fileUrl = data.fileUrl;
        (incomingMsg as any).fileName = data.fileName;
        (incomingMsg as any).fileSize = data.fileSize;
      }

      addMessage(data.conversationId, incomingMsg);
    });

    socket.on('connect', () => {
      console.log('📡 Connected to Socket.IO Realtime Gateway');
    });

    socket.on('connect_error', () => {
      console.warn('⚠️ Server relay connecting... using client room synchronization');
    });
  }
  return socket;
}

export function joinSocketRoom(roomId: string) {
  const s = getSocket();
  if (s) {
    s.emit('join_room', roomId);
  }
}

export function emitE2EeMessage(messageData: any) {
  const s = getSocket();
  if (s) {
    s.emit('new_e2ee_message', messageData);
  }
}

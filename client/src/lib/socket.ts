import { io, Socket } from 'socket.io-client';
import { useAppStore, Message } from './store';

let socket: Socket | null = null;

export function getSocket(userId: string = 'usr_alice', deviceId: string = 'dev_alice_1'): Socket {
  if (!socket) {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    socket = io(SERVER_URL, {
      query: { userId, deviceId },
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    // Handle incoming real-time messages from friends
    socket.on('receive_e2ee_message', (data: any) => {
      const { addMessage, currentUser } = useAppStore.getState();
      
      // Avoid duplicate self messages
      if (data.senderId === currentUser.id) return;

      const incomingMsg: Message = {
        id: data.messageId || `msg_recv_${Date.now()}`,
        conversationId: data.conversationId,
        senderId: data.senderId,
        messageType: data.messageType || 'TEXT',
        ciphertext: data.ciphertext,
        iv: data.iv,
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
  }
  return socket;
}

export function joinSocketRoom(roomId: string) {
  const s = getSocket();
  s.emit('join_room', roomId);
}

export function emitE2EeMessage(messageData: any) {
  const s = getSocket();
  s.emit('new_e2ee_message', messageData);
}

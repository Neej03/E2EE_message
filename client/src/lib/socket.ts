import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(userId: string = 'usr_alice', deviceId: string = 'dev_alice_1'): Socket {
  if (!socket) {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    socket = io(SERVER_URL, {
      query: { userId, deviceId },
      autoConnect: true,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

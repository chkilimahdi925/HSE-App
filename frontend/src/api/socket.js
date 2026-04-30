import { io } from 'socket.io-client';
import { BASE_URL } from '../config/env';

const socket = io(BASE_URL, {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 10000,
});

export { socket };
export default socket;

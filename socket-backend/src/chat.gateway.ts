import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket> = new Map();
  private rooms: Map<string, Socket[]> = new Map();

  afterInit(server: Server) {
    if (server) {
      console.log('WebSocket conectado');
    }
  }

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;

    this.connectedUsers.set(userId, socket);
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    this.connectedUsers.delete(userId);

    // Remove the disconnected client from all rooms
    this.rooms.forEach((roomUsers, roomId) => {
      const index = roomUsers.indexOf(socket);
      if (index !== -1) {
        roomUsers.splice(index, 1);
      }
    });
  }

  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, payload: { roomId: string, message: string }) {
    const roomId = payload.roomId;
    const message = payload.message;

    const senderId = client.handshake.query.userId;

    let roomUsers = this.rooms.get(roomId);

    if (!roomUsers) {
      roomUsers = [];
      this.rooms.set(roomId, roomUsers);
    }

    if (!roomUsers.includes(client)) {
      roomUsers.push(client);
    }

    roomUsers.forEach(receiver => {
      receiver.emit('chatToClient', { senderId, message });
    });
  }
}

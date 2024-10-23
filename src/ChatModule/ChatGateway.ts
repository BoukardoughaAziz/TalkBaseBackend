import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins (or set the allowed domains)
  },
}) // Enable CORS if you are testing on different origins
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  listOfUsers: Map<String, String> = new Map();
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {  
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: { sender: string; message: string },
  ): void {
    console.log(`Message from ${payload.sender}: ${payload.message}`);

    // Emit the message to all clients
    this.server.emit('message', {
      sender: payload.sender,
      message: payload.message,
    });
  }

  @SubscribeMessage('add-user')
  addUser(client: Socket, payload: any): void {
    console.log('Message from');
    this.listOfUsers.set('ss', payload);

    // Emit the message to all clients
    // this.server.emit('message', {
    //   sender: payload.sender,
    //   message: payload.message,
    // });
  }
}

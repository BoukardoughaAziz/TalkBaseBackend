// src/app.gateway.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';  
import { ChatServiceCallCenter } from 'src/sharedservices/ChatServiceCallCenter';
@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  namespace: '/NwidgetBackend/sockjs/callCenter',
})
@Injectable()
export class ChatGatewayCallCenter
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGatewayCallCenter.name);
  private readonly namespace: string;

  constructor(private chatService: ChatServiceCallCenter) {}

  @WebSocketServer()
  server: Server;
  client: Socket;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.client = client;
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('appAgentConnected')
  handleMessage(@MessageBody() data: any) {
    console.log(`Received message: ${data.message}`);
    // Broadcast the message to all clients
    this.server.emit('getListOfNonTreatedClients', {
      message: 'listOfNonTreatedClients',
    });
    //   const appAgentId = 'zzz';
    //   const listOfNonTreatedClients = this.chatService
    //     .getConversations(appAgentId)
    //     .then((listOfNonTreatedClients) => {
    //       this.server.emit('getListOfNonTreatedClients', {
    //         message: listOfNonTreatedClients,
    //       });
    //     })
    //     .catch((error) => {
    //       // Handle errors
    //       console.error('Error fetching non-treated clients:', error);
    //     });
  }
}

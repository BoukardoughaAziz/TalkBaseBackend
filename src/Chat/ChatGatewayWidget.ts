// src/app.gateway.ts
import { Logger } from '@nestjs/common';
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
import { ChatServiceClient } from 'src/sharedservices/ChatServiceClient';
import { StorageService } from 'src/storage/storage.service';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  namespace: '/NwidgetBackend/sockjs/widget',
})
export class ChatGatewayWidget
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGatewayWidget.name);
  private readonly namespace: string;

  constructor(private chatServiceClient: ChatServiceClient) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('s');
    
  } 

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('appAgentConnected')
  handleMessage(@MessageBody() data: any) {
    console.log(`Received message: ${data.message}`);
  }
  @SubscribeMessage('messageFromClientToAgent')
  messageFromClientToAgent(@MessageBody() data: any) {
    console.log(`Received message: ${data.message}`);
    let incomingChatMessage = null;
    this.chatServiceClient.addMessageFromClientToAgent(incomingChatMessage);
  }
}

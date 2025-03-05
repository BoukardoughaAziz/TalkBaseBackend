import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';  
import { ChatServiceCallCenter } from 'src/sharedservices/ChatServiceCallCenter';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  namespace: '/NwidgetBackend/sockjs/callCenter',
})
@Injectable()
export class ChatGatewayCallCenter implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGatewayCallCenter.name);

  constructor(private chatService: ChatServiceCallCenter) {}

  @WebSocketServer()
  server: Server;
  client: Socket;

  
  private reservations = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.client = client;
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('appAgentConnected')
  async handleMessage(@MessageBody() data: any) {
    console.log(`Received message: ${data.message}`);

    
    const listOfNonTreatedClients = await this.chatService.getNonTreatedClient();

    // reservation status 
    const clientsWithReservationStatus = listOfNonTreatedClients.map(client => ({
      id: client.identifier,
      name: client.humanIdentifier || 'Unknown User',
      isReserved: this.reservations.has(client.identifier),
      reservedBy: this.reservations.get(client.identifier) || null
    }));

    
    this.server.emit('getListOfNonTreatedClients', {
      message: clientsWithReservationStatus,
    });
  }

  // Agent reserves a client
  @SubscribeMessage('reserveClient')
  handleReservation(@MessageBody() data: { clientId: string; agentId: string }) {
    if (this.reservations.has(data.clientId)) {
      return { status: 'error', message: 'Client already reserved' };
    }

    this.reservations.set(data.clientId, data.agentId);
    this.server.emit('clientReserved', { clientId: data.clientId, agentId: data.agentId });

    return { status: 'success', message: 'Client reserved successfully' };
  }

 
  @SubscribeMessage('releaseClient')
  handleRelease(@MessageBody() data: { clientId: string }) {
    this.reservations.delete(data.clientId);
    this.server.emit('clientReleased', { clientId: data.clientId });
  }

 
  @SubscribeMessage('getReservations')
  handleGetReservations() {
    return Array.from(this.reservations.entries()).map(([clientId, agentId]) => ({ clientId, agentId }));
  }
}

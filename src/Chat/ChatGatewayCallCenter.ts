import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, MessageBody, WebSocketServer,
ConnectedSocket } from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { ConversationService } from '../conversation/conversation.service';
import { Conversation, ConversationDocument } from '../conversation/entities/conversation.entity';
import { ChatMessage } from '../models/ChatMessageSchema';
import { ChatServiceCallCenter } from '../sharedservices/ChatServiceCallCenter';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  namespace: '/NwidgetBackend/sockjs/callCenter',
})
@Injectable()
export class ChatGatewayCallCenter implements OnGatewayConnection, OnGatewayDisconnect {
private readonly logger = new Logger(ChatGatewayCallCenter.name);
private activeCalls = new Map<string, {caller: string, callee: string, type: 'audio' | 'video'}>();


constructor(
private chatService: ChatServiceCallCenter,
@InjectModel(Conversation . name)
private conversationModel: Model<ConversationDocument>,)
    {}

    @WebSocketServer()
    server: Server;
    client: Socket;


    private reservations = new Map<string, string>();

        handleConnection(client: Socket) {
        console.log(`Agent connected: ${client.id}`);
        this.server.emit('me', client.id);
        console.log('Agent id : ',client.id);
        }

        handleDisconnect(client: Socket) {
        console.log(`Agent disconnected: ${client.id}`);
        }

        @SubscribeMessage('add-message-agent')
        async handleMessage(@MessageBody() chatMessage: ChatMessage) {
        console.log('-------------------------------------------------------------')
        console.log("add-message-agent", chatMessage);
        console.log('-------------------------------------------------------------')                
        const conversation = await this.conversationModel.findOne({ AppClientID: chatMessage.conversationId }).exec();
        if (!conversation) {
        console.log("the conversation was not found ")
        const newConversation = new this.conversationModel({
        messages: [chatMessage],
        AppClientID:chatMessage.conversationId,
        })
        newConversation.save();
        this.server.emit('MESSAGE_FROM_AGENT_TO_CLIENT',chatMessage);
        return chatMessage;
        }else{
        console.log("the conversation was found ")
        conversation.messages.push(chatMessage);
        this.server.emit('MESSAGE_FROM_AGENT_TO_CLIENT', chatMessage);
        conversation.save();
        return chatMessage;
        }
        }


        @SubscribeMessage('joinConversation-agent')
        handleJoinConversation(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
        console.log("an agent has joined the conversation with this id", conversationId);
        client.join(conversationId);
        this.logger.log(`Client ${client.id} joined Conversation ${conversationId}`);
        }


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





 // WebRTC Signaling Methods (same as client gateway)
  @SubscribeMessage('initiateCall-agent')
  handleInitiateCall(
    @MessageBody() data: { conversationId: string; type: 'audio' | 'video' },
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`Call initiated in conversation ${data.conversationId}`);
    this.activeCalls.set(data.conversationId, {
      caller: client.id,
      callee: '',
      type: data.type
    });
    this.server.to(data.conversationId).emit('CALL_FROM_AGENT_TO_CLIENT', {
      initiator: client.id,
      type: data.type
    });
  }

  @SubscribeMessage('acceptCall-agent')
  handleAcceptCall(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket
  ) {
    const call = this.activeCalls.get(data.conversationId);
    if (call) {
      call.callee = client.id;
      this.server.to(data.conversationId).emit('AGENT-HAS-ACCEPTED-THE-CALL', {
        acceptor: client.id
      });
    }
  }

  @SubscribeMessage('rejectCall-agent')
  handleRejectCall(
    @MessageBody() data: { conversationId: string; reason: string },
    @ConnectedSocket() client: Socket
  ) {
    this.server.to(data.conversationId).emit('AGENT-HAS-REJECTED-THE-CALL', {
      rejector: client.id,
      reason: data.reason
    });
    this.activeCalls.delete(data.conversationId);
  }

  @SubscribeMessage('endCall-agent')
  handleEndCall(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket
  ) {
    this.server.to(data.conversationId).emit('AGENT-HAS-ENDED-THE-CALL', {
      endedBy: client.id
    });
    this.activeCalls.delete(data.conversationId);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { conversationId: string; offer: any },
    @ConnectedSocket() client: Socket
  ) {
    console.log("offer for the agent has been called")
    this.server.to(data.conversationId).except(client.id).emit('offer', {
      from: client.id,
      offer: data.offer
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { conversationId: string; answer: any },
    @ConnectedSocket() client: Socket
  ) {
    console.log("answer for the agent has been called")
    this.server.to(data.conversationId).except(client.id).emit('answer', {
      from: client.id,
      answer: data.answer
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { conversationId: string; candidate: any },
    @ConnectedSocket() client: Socket
  ) {
    console.log("ice-candidate for the agent has been called")
  
    this.server.to(data.conversationId).except(client.id).emit('ice-candidate', {
      from: client.id,
      candidate: data.candidate
    });
  }
}
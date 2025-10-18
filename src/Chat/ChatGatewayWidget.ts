// src/app.gateway.ts
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
SubscribeMessage,
WebSocketGateway,
OnGatewayConnection,
OnGatewayDisconnect,
MessageBody,
WebSocketServer,
ConnectedSocket,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Conversation, ConversationDocument } from '../conversation/entities/conversation.entity';
import { AppAgent, AppAgentDocument } from '../models/AppAgentSchema';
import { ChatMessage } from '../models/ChatMessageSchema';
import { ChatServiceClient } from '../sharedservices/ChatServiceClient';
import { StorageService } from '../storage/storage.service';
import { BaseBuddyService } from './base-buddy/base-buddy.service';
import { UserDeviceInfo } from '../models/UserDeviceInfo';
import { AppClient, AppClientDocument } from '../models/AppClientSchema';
import { ConversationService } from '../conversation/conversation.service';

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
private activeCalls = new Map<string, {caller: string, callee: string, type: 'audio' | 'video'}>();


constructor(
@InjectModel(Conversation . name)
private conversationModel: Model<ConversationDocument>,

@InjectModel(AppAgent.name)
private appAgentModel: Model<AppAgentDocument>,
    
@InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
    private chatServiceClient: ChatServiceClient,
    private conversationService: ConversationService,
    
    ) {}

    @WebSocketServer()
    server: Server;
    client: Socket;

    handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('me',client.id);
    console.log('Client id : ',client.id);
    }

    handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    }


    @SubscribeMessage('add-message-client')
    async handleMessage(@MessageBody() chatMessage: ChatMessage) {
    console.log('\n-------------------------------------------------------------')
    console.log('-------------------------------------------------------------')
    console.log("add-message-client was called", chatMessage.message);
    console.log("this is the chatMessage.appClient.appagentid", chatMessage.appClient);
    console.log("this is the chatMessage", chatMessage);
    console.log('-------------------------------------------------------------')
    console.log('-------------------------------------------------------------\n')
    const conversation = await this.conversationModel.findOne({ AppClientID: chatMessage.conversationId }).exec();
    if (!conversation) {
    console.log("the conversation was not found ")
    const newConversation = new this.conversationModel({
    messages: [chatMessage],
    AppClientID:chatMessage.appClient.humanIdentifier,
    })
    newConversation.save();
    this.server.emit('MESSAGE_FROM_CLIENT_TO_AGENT', chatMessage);
    return chatMessage;
    }else{
    console.log("the conversation was found")
    conversation.messages.push(chatMessage);
    this.server.emit('MESSAGE_FROM_CLIENT_TO_AGENT', chatMessage);
    conversation.save();
    return chatMessage;
    }
    }


    @SubscribeMessage('joinConversation-client')
    handleJoinConversation(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    console.log("a client has joined the conversation with this id", conversationId);
    client.join(conversationId);
    this.logger.log(`Client ${client.id} joined Conversation ${conversationId}`);
    }


    @SubscribeMessage('messageFromClientToAgent')
    messageFromClientToAgent(@MessageBody() data: any) {
    console.log(`Received message: ${data.message}`);
    let incomingChatMessage = null;
    this.chatServiceClient.addMessageFromClientToAgent(incomingChatMessage);
    }


 // WebRTC Signaling Methods
@SubscribeMessage('calluser')
async handlecallUser(
  @MessageBody() data: {
    userToCall: string  
    signalData: any;  
    from: any;
    name: any;  
    to: any; 
    calltype:boolean
  }
) {
  console.log("calluser has been called");

  try {
    // Await the database query
    const agentToCall = await this.appAgentModel.findById(data.userToCall).exec();
    
    // if (!agentToCall) {
    //   console.error(`Agent with ID ${data.userToCall} not found`);
    //   // Optionally send an error back to the caller
    //   return;
    // }

    console.log("this is the agent to call", agentToCall.SocketId);
    this.server.emit("callUser", { signal: data.signalData, from: data.from,to: agentToCall.SocketId, name: data.name })
    // Emit the call signal to the specific agent
    this.server.to(agentToCall.SocketId).emit("callUser", { 
      signal: data.signalData, 
      from: data.from,
      to: data.to, 
      name: data.name 
    });
  } catch (error) {
    console.error("Error finding agent:", error);
  }
}


  
  @SubscribeMessage('answercall')
  handleanswerCall(
  @MessageBody() data: {signal: any,to:string },
  ){
    console.log("call accepted")
    console.log("-------------------------------------------------")
    console.log("this is the socketid that accepted the call",data.to)
    console.log("signal",data.signal)
    console.log("-------------------------------------------------")
		this.server.emit("callaccepted",  data.signal)
  }



@SubscribeMessage('StartConversation')
async StartConversation(@MessageBody() data: {AppClient:AppClient,UserDeviceInfo:UserDeviceInfo, isThisAnAiConversation: boolean}) {
  let NewConversation: Conversation; 
  console.log('this is the received app client', data.AppClient);
  console.log('this is the received user device info', data.UserDeviceInfo);
  NewConversation = await this.chatServiceClient.StartConversation(data.AppClient, data.UserDeviceInfo, data.isThisAnAiConversation);
  console.log("this is the new conversation", NewConversation);
  this.server.emit('ConversationStarted',NewConversation, NewConversation.AppAgentID);
}




@SubscribeMessage('markConversationsHandledByHuman')
async handleMarkConversationsHandledByHuman(
  @MessageBody() data: { appClientId: string }
) {
  console.log("this is the received data ",data)
  console.log("Marking conversation as handled by human for AppClientID:", data.appClientId);
  const updated = await this.conversationService.markConversationsHandledByHuman(data.appClientId);
  if (updated) {
    this.server.emit('AConversationWillBeHandledByAgent', data.appClientId);
    return { status: 200, message: 'Conversation handed over to human' };
  } else {
    return { status: 404, message: 'Conversation not found or already handled by human' };
  }
}
}







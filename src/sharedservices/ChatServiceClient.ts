import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../models/ChatMessageSchema';
import { AppClient, AppClientDocument, AppClientSchema } from '../models/AppClientSchema';
import { AppClientService } from './AppClientService';
import { v4 as uuidv4 } from 'uuid';
import AppUtil from '../utils/AppUtil';
import ChatEvent from '../models/ChatEvent';
import ChatDirection from '../models/ChatDirection';
import { SharedServicesUtil } from './SharedServicesUtil';
import { StorageService } from '../storage/storage.service';
import { ChatGatewayCallCenter } from '../Chat/ChatGatewayCallCenter';
import { UserDeviceInfo, UserDeviceInfoDocument } from '../models/UserDeviceInfo';
import { AppAgent, AppAgentDocument } from '../models/AppAgentSchema';
import { Conversation, ConversationDocument } from '../conversation/entities/conversation.entity';

@Injectable()
export class ChatServiceClient {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
    @InjectModel(UserDeviceInfo.name) 
    private UserDeviceInfo: Model<UserDeviceInfoDocument>,

    @InjectModel(AppAgent.name) 
    private AppAgent: Model<AppAgentDocument>,


    @InjectModel(Conversation.name) 
    private conversationModel: Model<ConversationDocument>,

    private appClientService: AppClientService,
    private storageService: StorageService,
    private chatGatewayCallCenter: ChatGatewayCallCenter,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // Map to track reserved clients (clientId -> agentId)
  private reservations = new Map<string, string>();

  async addMessageFromClientToAgent(incomingChatMessage: any) {
    console.log("addMessageFromClientToAgent Was Called");
    let appClient: AppClient;
    if (incomingChatMessage.appClientIdentifier == null) {
      appClient = new AppClient();
      appClient.identifier = uuidv4();
      appClient.humanIdentifier = 'user_' + AppUtil.getRandomInt();
      appClient.ipAddress = incomingChatMessage.ipAddress;
      appClient.identifier = AppUtil.generateRandomString(20);

      await this.appClientModel.create([appClient]);
    } else {
      let appClients: Array<AppClient> = await this.appClientService.find({
        identifier: incomingChatMessage.appClientIdentifier,
      });
      appClient = appClients.at(0);
    }

    console.log(ChatDirection[incomingChatMessage.chatDirection]);
    if (incomingChatMessage.chatEvent == ChatEvent.NewClientStartOpenChatWidget) {
      this.storageService.set(appClient.identifier, JSON.stringify(appClient));
      this.chatGatewayCallCenter.server.emit(
        'UPDATE_TOTAL_NUMBER_OF_LIVE_CLIENTS',
        this.storageService.totalLength(),
      );
    }

    const chatMessage = await SharedServicesUtil.saveChatMessage(
      this.chatMessageModel,
      appClient,
      incomingChatMessage,
    );

    return chatMessage;
  }


async StartConversation(AppClient: AppClient, UserDeviceInfo: UserDeviceInfo, isThisAnAiConversation: boolean): Promise<Conversation> {
  let appclient = new this.appClientModel();
  let NewConversation = new this.conversationModel();
  let appagent = new this.AppAgent();
  let UDI = new this.UserDeviceInfo();

  // Find agent with least number of conversations using aggregation
  const agentResult = await this.AppAgent.aggregate([
    {
      $addFields: {
        conversationCount: { $size: { $ifNull: ['$Conversations', []] } }
      }
    },
    {
      $sort: { conversationCount: 1 }
    },
    {
      $limit: 1
    }
  ]);
  
  if (!agentResult || agentResult.length === 0) {
    console.log("no agent was found");
    throw new Error('No available agent found');
  }
  
  // Get the actual Mongoose document using the _id from aggregation result
  appagent = await this.AppAgent.findById(agentResult[0]._id);

  if (!appagent) {
    throw new Error('Agent not found');
  }

  appclient.humanIdentifier = 'user_' + AppUtil.getRandomInt();
  appclient.identifier = uuidv4();
  appclient.ipAddress = AppClient.ipAddress;
  appclient.country = AppClient.country;
  appclient.associatedAgent = appagent; 

  NewConversation.AppAgentID = appagent._id;
  NewConversation.AppAgentName = appagent.firstname + " " + appagent.lastname;
  NewConversation.AppClientID = appclient.humanIdentifier;
  NewConversation.isHandledBy_BB = isThisAnAiConversation;

  UDI.userIdentifier = appclient.identifier;
  UDI.appBrowser = UserDeviceInfo.appBrowser;
  UDI.appOs = UserDeviceInfo.appOs;
  UDI.cpuCores = UserDeviceInfo.cpuCores;
  UDI.deviceMemoryGB = UserDeviceInfo.deviceMemoryGB;
  UDI.screenWidth = UserDeviceInfo.screenWidth;
  UDI.screenHeight = UserDeviceInfo.screenHeight;
  UDI.pixelRatio = UserDeviceInfo.pixelRatio;
  UDI.language = UserDeviceInfo.language;
  UDI.timezone = UserDeviceInfo.timezone;
  UDI.connectionType = UserDeviceInfo.connectionType;

  // Save the conversation first
  await NewConversation.save();

  // Add conversation to agent and save
  appagent.ConversationsIDs.push(NewConversation._id);
  // console.log("this is the agent that will be handling the conversation", appagent);
  console.log("----------------------------------------");
  // console.log("this is his conversationsIDs ", appagent.ConversationsIDs);

  // Save all documents
  await appclient.save();
  await appagent.save();
  await UDI.save();

  console.log("this is the appclient : ", appclient);

  return NewConversation; // This now returns AppClientDocument
}

  async getNonTreatedClient() {
    let listOfNonTreatedClients = await this.appClientModel
      .find({ associatedAgent: null })
      .sort({ updatedAt: 1 })
      .exec();

    return listOfNonTreatedClients;
  }

  async getConversations(clientIdentifier) {
    const chatMessages = await this.chatMessageModel
      .find({
        'appClient.identifier': clientIdentifier,
        chatEvent: { $ne: 'NewClientStartOpenChatWidget' },
      })
      .exec();
    return chatMessages;
  }

  async create(cat: ChatMessage): Promise<ChatMessage> {
    const createdCat = new this.chatMessageModel(cat);
    return createdCat.save();
  }

  async findAll(): Promise<ChatMessage[]> {
    return this.chatMessageModel.find().exec();
  }

  find(query: any): Promise<ChatMessage[]> {
    return this.chatMessageModel.find(query).sort({ updatedAt: 1 }).exec();
  }

  
    // live clients including reservation status.
  
  async getLiveClients() {
    const liveClients = await this.appClientModel.find().exec();
    return liveClients.map(client => ({
      id: client.identifier,
      name: client.humanIdentifier || 'Unknown User',
      isReserved: this.reservations.has(client.identifier),
      reservedBy: this.reservations.get(client.identifier) || null
    }));
  }

 
  async reserveClient(clientId: string, agentId: string) {
    if (this.reservations.has(clientId)) {
      return { status: 'error', message: 'Client already reserved' };
    }

    this.reservations.set(clientId, agentId);
    this.chatGatewayCallCenter.server.emit('clientReserved', { clientId, agentId });

    return { status: 'success', message: 'Client reserved successfully' };
  }

  
  async releaseClient(clientId: string) {
    this.reservations.delete(clientId);
    this.chatGatewayCallCenter.server.emit('clientReleased', { clientId });

    return { status: 'success', message: 'Client released successfully' };
  }


}

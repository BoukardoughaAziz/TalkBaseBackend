import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../models/ChatMessageSchema';
import { AppClient, AppClientDocument } from '../models/AppClientSchema';
import { AppClientService } from './AppClientService';
import { SharedServicesUtil } from './SharedServicesUtil';
import { StorageService } from '../storage/storage.service';
import { Conversation, ConversationDocument } from '../conversation/entities/conversation.entity';

@Injectable()
export class ChatServiceCallCenter {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
    @InjectModel(Conversation.name) 
    private conversationModel: Model<ConversationDocument>,
    
    private appClientService: AppClientService,
    private storageService: StorageService,
  ) {}

  async addMessageFromAgentToClient(incomingChatMessage: ChatMessage) {
    console.log('-------------------------------------------------------------')
    console.log('-------------------------------------------------------------')
    console.log("add Message From Agent To Client Service was called " )
    console.log("this is the meesage : "+incomingChatMessage.message )
    console.log('-------------------------------------------------------------')
    console.log('-------------------------------------------------------------')

    const conversation = await this.conversationModel.findOne({ AppClientID: incomingChatMessage.conversationId }).exec();
    if (!conversation) {
        const newConversation = new this.conversationModel({                
            messages: [incomingChatMessage],
            AppClientID:incomingChatMessage.appClient.humanIdentifier,
        })
         newConversation.save();
         return incomingChatMessage;

    }else{
    conversation.messages.push(incomingChatMessage);
     conversation.save();
     return incomingChatMessage;
    }
  }
  async getCallCenterDashboard(callCenterAgentEmail: String) {
    let map = new Map<any, any[]>();
    const storageServiceEntries = this.storageService.getEntriesLocalMap();
    for (const [key, value] of storageServiceEntries) {
      const appClient: AppClient = JSON.parse(value);
      if (appClient.associatedAgent == null)  {
        const listOfMessages = await this.appClientService.getClientMessages(
          appClient.identifier,
        );
        map.set(value, listOfMessages);
      }
    }
    const serializedMap = Object.fromEntries(map);
    console.log(serializedMap);
    return serializedMap;
  }
  addIncomingMessageFromClientToAgent(incomingChatMessage: any): any {
    let chatMessage: ChatMessage = new ChatMessage();
    chatMessage.appClient = incomingChatMessage.appClient;
    chatMessage.chatDirection = incomingChatMessage.chatDirection;
    chatMessage.chatEvent = incomingChatMessage.chatEvent;
    this.create(chatMessage);
    let appClient: AppClient = new AppClient();
    appClient.identifier = incomingChatMessage.identifier;
    appClient.ipAddress = incomingChatMessage.ipAddress;
    this.appClientService.create(appClient);
  }
  async getNonTreatedClient() {
    let listOfNonTreatedClients = await this.appClientModel
      .find({ associatedAgent: null })
      .sort({ updatedAt: 1 })
      .exec();

    return listOfNonTreatedClients;
  }

  async getConversations(appAgentId) {
    const chatMessages = await this.chatMessageModel
      .find()
      .populate({ path: 'appClient', match: { associatedAgent: appAgentId } })
      .exec();
    const currentConversations = chatMessages.filter(
      (chatMessage) => chatMessage.appClient !== null,
    );
    return currentConversations;
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
}

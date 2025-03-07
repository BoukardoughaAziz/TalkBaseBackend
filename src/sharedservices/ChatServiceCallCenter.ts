import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../models/ChatMessageSchema';
import { AppClient, AppClientDocument } from 'src/models/AppClientSchema';
import { AppClientService } from './AppClientService';
import { SharedServicesUtil } from './SharedServicesUtil';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class ChatServiceCallCenter {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
    private appClientService: AppClientService,private storageService:StorageService
  ) {}

  async addMessageFromAgentToClient(incomingChatMessage: any) {
    const chatMessage = await SharedServicesUtil.saveChatMessage(
      this.chatMessageModel,
      incomingChatMessage.appClient,
      incomingChatMessage,
    );
    return chatMessage;
  }
  async getCallCenterDashboard(
    callCenterAgentEmail: String,
  ): Promise<Map<any, any[]>> {
    const zz=this.storageService.getEntries();
    const listOfClients =
      await this.appClientService.findUntreatedClientsAndAgentClients(
        callCenterAgentEmail,
      );
    let map: Map<any, any> = new Map();
    for (var client of listOfClients) {
      console.log(client.identifier);
      const listOfMessages: Array<ChatMessage> = await this.chatMessageModel
        .find({ 'appClient.identifier': client.identifier })
        .exec();
      map.set(client, listOfMessages);
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
    appClient.appOS = incomingChatMessage.appOS;
    appClient.appBrowser = incomingChatMessage.appBrowser;
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

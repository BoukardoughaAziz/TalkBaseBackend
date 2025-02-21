import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../models/ChatMessageSchema';
import { AppClient, AppClientDocument } from 'src/models/AppClientSchema';
import { AppClientService } from './AppClientService';
import { v4 as uuidv4 } from 'uuid';
import AppUtil from 'src/utils/AppUtil';
import ChatEvent from 'src/models/ChatEvent';
import ChatDirection from 'src/models/ChatDirection';
import { SharedServicesUtil } from './SharedServicesUtil';
import { StorageService } from 'src/storage/storage.service';
import { ChatGatewayCallCenter } from 'src/Chat/ChatGatewayCallCenter';
import * as crypto from 'crypto';
@Injectable()
export class ChatServiceClient {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
    private appClientService: AppClientService,
    private storageService: StorageService,
    private chatGatewayCallCenter: ChatGatewayCallCenter,
    @InjectConnection() private readonly connection: Connection,
  ) {}
  async addMessageFromClientToAgent(incomingChatMessage: any) {
    /* const session = await this.connection.startSession();
    session.startTransaction();
*/
    let appClient: AppClient;
    // try {
    if (incomingChatMessage.appClientIdentifier == null) {
      appClient = new AppClient();
      appClient.appOS = incomingChatMessage.appOS;
      appClient.appBrowser = incomingChatMessage.appBrowser;
      appClient.identifier = uuidv4();
      appClient.humanIdentifier = 'user_' + AppUtil.getRandomInt();
      appClient.ipAddress = incomingChatMessage.ipAddress;
      appClient.countryCode = incomingChatMessage.countryCode;
      appClient.city = incomingChatMessage.city;
      appClient.org = incomingChatMessage.org;
      appClient.identifier = AppUtil.generateRandomString(20);

      await this.appClientModel.create([appClient]); //{ session }
    } else {
      let appClients: Array<AppClient> = await this.appClientService.find({
        identifier: incomingChatMessage.appClientIdentifier,
      });
      appClient = appClients.at(0);
    }
    console.log(ChatDirection[incomingChatMessage.chatDirection]);
    if (
      incomingChatMessage.chatEvent == ChatEvent.NewClientStartOpenChatWidget
    ) { 
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

    /*   await session.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of an error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }*/
    return chatMessage;
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
}
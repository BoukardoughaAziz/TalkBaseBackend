import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../models/ChatMessageSchema';
import { AppClient, AppClientDocument } from 'src/models/AppClientSchema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
  ) {}

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

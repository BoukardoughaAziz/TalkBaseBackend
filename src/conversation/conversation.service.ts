import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from 'src/models/ChatMessageSchema';
import { Conversation, ConversationDocument } from './entities/conversation.entity';

@Injectable()
export class ConversationService {

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  async addMessage( message: ChatMessage): Promise<ChatMessage> {
    console.log("thisis the appclientid"+message.appClient.humanIdentifier )
    const conversation = await this.conversationModel.findOne({ AppClientID: message.appClient.humanIdentifier }).exec();
    if (!conversation) {
        const newConversation = new this.conversationModel({                
            messages: [message],
            AppClientID:message.appClient.humanIdentifier,
        })
         newConversation.save();
         return message;

    }else{
    conversation.messages.push(message);
     conversation.save();
     return message;
    }
}

async create(conversation: Conversation): Promise<Conversation> {
    const { AppClientID } = conversation;
    const existingConversation = await this.conversationModel.findOne({ AppClientID });
    if (existingConversation) {
        throw new ConflictException('Conversation already exists');
    }

    const createdConversation = new this.conversationModel(conversation);
    return createdConversation.save();
}

async findAll(): Promise<Conversation[]> {
    return this.conversationModel.find().exec();
}

async findByAppClientID(AppClientID: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findOne({ AppClientID: AppClientID }).exec();
    if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${AppClientID} not found`);
    }
    return conversation;
}

async findOne(id: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(id).exec();
    if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
}

async update(id: string, conversation: Conversation): Promise<Conversation> {
    const updatedConversation = await this.conversationModel.findByIdAndUpdate(id, conversation, { new: true }).exec();
    if (!updatedConversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return updatedConversation;
}

async remove(id: string): Promise<Conversation> {
    const deletedConversation = await this.conversationModel.findByIdAndDelete(id).exec();
    if (!deletedConversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return deletedConversation;
}
}

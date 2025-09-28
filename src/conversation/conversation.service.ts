import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '../models/ChatMessageSchema';
import { Conversation, ConversationDocument } from './entities/conversation.entity';
import { AgentType, AppAgent, AppAgentDocument } from '../models/AppAgentSchema';

@Injectable()
export class ConversationService {

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(AppAgent.name) private appAgentDocument: Model<AppAgentDocument>,
    
  ) {}

  async addMessage( message: ChatMessage): Promise<ChatMessage> {
    console.log("this is the appclientid"+message.appClient.humanIdentifier )
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
  console.log("this is the id we're looking for:", AppClientID);
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


async findAgentWithLeastConversations(): Promise<AppAgent | null> {
  // Only consider approved agents
  const agents = await this.appAgentDocument.find({ type: AgentType.AGENT, isApproved: true }).lean();
  if (!agents.length) return null;

  // Find agent with minimum conversations (handle undefined ConversationsIDs as 0)
  let minAgent = agents[0];
  let minCount = Array.isArray(minAgent.ConversationsIDs) ? minAgent.ConversationsIDs.length : 0;

  for (const agent of agents) {
    const count = Array.isArray(agent.ConversationsIDs) ? agent.ConversationsIDs.length : 0;
    if (count < minCount) {
      minAgent = agent;
      minCount = count;
    }
  }

  return this.appAgentDocument.findById(minAgent._id);
}


async getConversationsByAgentId(agentId: string): Promise<Conversation[]> {
  console.log("This is the agent ID we're looking for conversations:", agentId);

  const agent = await this.appAgentDocument.findById(agentId).exec();
  if (!agent) {
    throw new NotFoundException(`Agent with ID ${agentId} not found`);
  }

  if (!Array.isArray(agent.ConversationsIDs) || agent.ConversationsIDs.length === 0) {
    return [];
  }

  return this.conversationModel.find({ _id: { $in: agent.ConversationsIDs } }).exec();
}


async markConversationsHandledByHuman(appClientId: string): Promise<{ status: number; message: string }> {
  const conversation = await this.conversationModel.findOne({ AppClientID: appClientId }).exec();

  if (!conversation) {
    return { status: 404, message: "Conversation not found" };
  }

  if (conversation.isHandledBy_BB) {
    conversation.isHandledBy_BB = false;
    await conversation.save();
    return { status: 200, message: "Conversation handed over to human" };
  }

  return { status: 200, message: "Conversation was already handled by human" };
}



}

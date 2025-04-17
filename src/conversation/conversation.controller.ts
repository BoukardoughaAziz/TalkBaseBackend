import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Logger } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ChatServiceCallCenter } from 'src/sharedservices/ChatServiceCallCenter';
import { ChatGatewayWidget } from 'src/Chat/ChatGatewayWidget';
import { ChatGatewayCallCenter } from 'src/Chat/ChatGatewayCallCenter';
import { ChatMessage } from 'src/models/ChatMessageSchema';
import { SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { Conversation } from './entities/conversation.entity';

@Controller('conversation')
export class ConversationController {
  private readonly logger = new Logger(ConversationController.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private conversationService: ConversationService,
  ) {}
  @Get('/findByAppClientID/:AppClientID')
  async findByAppClientID(@Param('AppClientID') AppClientID: string) {
    console.log("AppClientID : ", AppClientID);
    const conversation : Conversation= await this.conversationService.findByAppClientID(AppClientID);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${AppClientID} not found`);
    }
    return conversation;
  }

  @SubscribeMessage('All_Conversations')
  @Get('getAllConversations')
  async getAllConversations() {
    let conversations: Conversation[] = await this.conversationService.findAll();
    this.logger.log('All conversations fetched');


    return conversations;
  }
}

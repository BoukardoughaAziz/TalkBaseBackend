import { Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { AppClient } from 'src/models/AppClientSchema';
 

import { ChatMessage } from 'src/models/ChatMessageSchema';
import { AppClientService } from 'src/services/AppClientService';
import { ChatService } from 'src/services/ChatService';

@Controller('api/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  constructor(private readonly chatService: ChatService,private readonly appClientService: AppClientService) {}
  @Post()
  addMessage(@Query() incomingChatMessage: any): any {
    let chatMessage: ChatMessage = new ChatMessage();
    chatMessage.appClientIdentifier = incomingChatMessage.id;
    chatMessage.chatDirection = incomingChatMessage.chatDirection;
    chatMessage.chatEvent = incomingChatMessage.chatEvent;
    this.chatService.create(chatMessage);
    let appClient: AppClient = new AppClient();
    appClient.os = incomingChatMessage.os;
    appClient.browser = incomingChatMessage.browser;
    appClient.identifier = incomingChatMessage.identifier;
    appClient.ipAddress = incomingChatMessage.ipAddress;
    this.appClientService.create(appClient);
  }
  @Get('getMessages')
  getMessages(@Query() incomingChatMessage: ChatMessage) {
    let array: Array<ChatMessage> = new Array();

    return array;
  }
}

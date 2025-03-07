import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { AppClient } from 'src/models/AppClientSchema';
import { ChatMessage } from 'src/models/ChatMessageSchema';
import { AppClientService } from 'src/sharedservices/AppClientService';
import { ChatServiceClient } from 'src/sharedservices/ChatServiceClient';
import { ChatGatewayCallCenter } from './ChatGatewayCallCenter';

@Controller('api/chat/widget')
export class ChatWidgetController {
  private readonly logger = new Logger(ChatWidgetController.name);

  constructor(
    private chatGatewayCallCenter: ChatGatewayCallCenter,
    private readonly chatServiceClient: ChatServiceClient,
    private readonly appClientService: AppClientService,
  ) {}
  @Post('/clientStartVideoCall')
  async clientStartVideoCall(@Query('appClientId') appClientId: string) {
  
    this.chatGatewayCallCenter.server.emit('CLIENT_START_VIDEO_CALL', appClientId);
    console.log('Client Start Video call ' + appClientId);
  }
  @Post('/addMessageFromClientToAgent')
  async addMessageFromClientToAgent(@Body() incomingChatMessage: any) {
    const chatMessage = await this.chatServiceClient.addMessageFromClientToAgent(incomingChatMessage);
    console.log(chatMessage.appClient.city);
    console.log(JSON.stringify(chatMessage));
    this.chatGatewayCallCenter.server.emit('MESSAGE_FROM_CLIENT_TO_AGENT', JSON.stringify(chatMessage));
    console.log('send MESSAGE_FROM_CLIENT_TO_AGENT ' + chatMessage);
  }

  @Post('initClientToCallCenterChatConversations')
  async initClientToCallCenterChatConversations(@Body() incomingChatMessage: any) {
    const chatMessage = await this.chatServiceClient.addMessageFromClientToAgent(incomingChatMessage);
    this.chatGatewayCallCenter.server.emit('MESSAGE_FROM_CLIENT_TO_AGENT', JSON.stringify(chatMessage));
    const conversations = await this.chatServiceClient.getConversations(chatMessage.appClient.identifier);
    return { appClient: chatMessage.appClient, conversations: conversations };
  }

  @Get('getConversations')
  async getConversations(@Query('callCenterAgentId') callCenterAgentId: string) {
    let array: Array<ChatMessage> = new Array();
    const chatConversations = await this.chatServiceClient.getConversations(callCenterAgentId);
    return chatConversations;
  }
}

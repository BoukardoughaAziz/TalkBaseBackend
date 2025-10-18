import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { AppClient } from '../models/AppClientSchema';
import { ChatMessage } from '../models/ChatMessageSchema';
import { AppClientService } from '../sharedservices/AppClientService';
import { ChatServiceClient } from '../sharedservices/ChatServiceClient';
import { ChatGatewayCallCenter } from './ChatGatewayCallCenter';
import { UserDeviceInfo } from '../models/UserDeviceInfo';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('api/chat/widget')
export class ChatWidgetController {
  private readonly logger = new Logger(ChatWidgetController.name);

  constructor(
    private chatGatewayCallCenter: ChatGatewayCallCenter,
    private readonly chatServiceClient: ChatServiceClient,
    private readonly appClientService: AppClientService,
  ) {}

  @Post('/addMessageFromClientToAgent')
  async addMessageFromClientToAgent(@Body() incomingChatMessage: any) {
    const chatMessage = await this.chatServiceClient.addMessageFromClientToAgent(incomingChatMessage);
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

  @Post('StartConversation')
async StartConversation(
  @Body('appClient') AppClient: AppClient,
  @Body('UserDeviceInfo') UserDeviceInfo: UserDeviceInfo,
  @Body('isThisAnAiConversation') isThisAnAiConversation: boolean,
  @Req() req: Request
) {
  console.log("=== REQUEST INFO ===");
  console.log("Request URL:", req.url);
  console.log("Request Origin:", req.get('Origin'));
  console.log("Request Referer:", req.get('Referer'));
  console.log("Client IP:", req.ip);
  console.log("User-Agent:", req.get('User-Agent'));
  console.log("===================");
  
  console.log("this is is the appclient", AppClient);
  console.log("-------------------------------------------------------");
  console.log("this is is the userdeviceinfo", UserDeviceInfo);
  console.log("-------------------------------------------------------");
  console.log("is this an ai conversation ?", isThisAnAiConversation);
  const appclient = await this.chatServiceClient.StartConversation(AppClient, UserDeviceInfo, isThisAnAiConversation);
  return appclient;
}

  @Get('getConversations')
  async getConversations(@Query('callCenterAgentId') callCenterAgentId: string) {
    let array: Array<ChatMessage> = new Array();
    const chatConversations = await this.chatServiceClient.getConversations(callCenterAgentId);
    return chatConversations;
  }

  

}

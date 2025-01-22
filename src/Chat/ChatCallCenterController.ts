import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { AppClient } from 'src/models/AppClientSchema';
import { ChatMessage } from 'src/models/ChatMessageSchema';
import { AppClientService } from 'src/sharedservices/AppClientService';
import { ChatServiceCallCenter } from 'src/sharedservices/ChatServiceCallCenter';
import { ChatGatewayWidget } from './ChatGatewayWidget';

@Controller('api/chat/callcenter')
export class ChatCallCenterController {
  private readonly logger = new Logger(ChatCallCenterController.name);
  constructor(
    private readonly chatServiceCallCenter: ChatServiceCallCenter,
    private readonly chatGatewayWidget: ChatGatewayWidget,
  ) {}

  @Get('getCallCenterDashboard')
  async   getCallCenterDashboard(
    @Query('callCenterAgentEmail') callCenterAgentEmail: string,
  ) :Promise<Map<AppClient, ChatMessage[]>> {
    let ret= await this.chatServiceCallCenter.getCallCenterDashboard(
      callCenterAgentEmail,
    );
    console.log(ret)
    return ret;
  }
  
   @Post('/addMessageFromAgentToClient')
    async addMessageFromAgentToClient(@Body() incomingChatMessage: any) {
      const chatMessage =
        await this.chatServiceCallCenter.addMessageFromAgentToClient(
          incomingChatMessage,
        );
     
   
      this.chatGatewayWidget.server.emit(
        'MESSAGE_FROM_AGENT_TO_CLIENT',
        JSON.stringify(chatMessage),
      ); 
      this.logger.log(`Send message from Agent to Client : ${JSON.stringify(chatMessage)}`);
    }

}

import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { AppClient } from 'src/models/AppClientSchema';
import { ChatMessage } from 'src/models/ChatMessageSchema';
import { ChatServiceClient } from 'src/sharedservices/ChatServiceClient';
import { ChatServiceCallCenter } from 'src/sharedservices/ChatServiceCallCenter';
import { ChatGatewayWidget } from './ChatGatewayWidget';
import { ChatGatewayCallCenter } from 'src/Chat/ChatGatewayCallCenter';

@Controller('api/chat/callcenter')
export class ChatCallCenterController {
  private readonly logger = new Logger(ChatCallCenterController.name);
  constructor(
    private readonly chatServiceCallCenter: ChatServiceCallCenter,
    private readonly chatServiceClient: ChatServiceClient,
    private readonly chatGatewayWidget: ChatGatewayWidget,
    private readonly chatGatewayCallCenter: ChatGatewayCallCenter,
  ) {}

  @Get('getCallCenterDashboard')
  async getCallCenterDashboard(
    @Query('callCenterAgentEmail') callCenterAgentEmail: string,
  ) {
    let ret =
      await this.chatServiceCallCenter.getCallCenterDashboard(
        callCenterAgentEmail,
      );  
    console.log('retttttttttttttttttttttt ' + ret);

    return ret;
  }
  @Post('/agentStartVideoCall')
  async agentStartVideoCall(
    @Query('agentId') agentId: string,
    @Query('appClientId') appClientId: string,
  ) {
    this.chatGatewayCallCenter.server.emit('AGENT_START_VIDEO_CALL', {
      agentId,
      appClientId,
    });
    console.log(
      `Agent ${agentId} started video call with client ${appClientId}`,
    );
  }

  @Post('/addMessageFromAgentToClient')
  async addMessageFromAgentToClient(@Body() incomingChatMessage: any) {
    const chatMessage =
      await this.chatServiceCallCenter.addMessageFromAgentToClient(
        incomingChatMessage,
      );

    this.chatGatewayWidget.server.emit(
      `MESSAGE_FROM_AGENT_TO_CLIENT_${incomingChatMessage.appClient.identifier}`,
      JSON.stringify(chatMessage),
    );
    this.logger.log(
      `Send message from Agent to Client : ${JSON.stringify(chatMessage)}`,
    );
  }

  //live client with reservation
  @Get('/live-clients')
  async getLiveClients() {
    const clients = await this.chatServiceClient.getLiveClients();
    return { clients };
  }

  @Post('/reserveClient')
  async reserveClient(@Body() body: { clientId: string; agentId: string }) {
    const response = await this.chatServiceClient.reserveClient(
      body.clientId,
      body.agentId,
    );

    if (response.status === 'success') {
      this.chatGatewayCallCenter.server.emit('clientReserved', {
        clientId: body.clientId,
        agentId: body.agentId,
      });
    }

    return response;
  }

  @Post('/releaseClient')
  async releaseClient(@Body() body: { clientId: string }) {
    const response = await this.chatServiceClient.releaseClient(body.clientId);

    if (response.status === 'success') {
      this.chatGatewayCallCenter.server.emit('clientReleased', {
        clientId: body.clientId,
      });
    }

    return response;
  }
}

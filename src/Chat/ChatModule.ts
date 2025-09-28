import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@nestjs/config';
import { AppClient, AppClientSchema } from '../models/AppClientSchema';
import { ChatMessage, ChatMessageSchema } from '../models/ChatMessageSchema';

import { RedisModule } from '../redis/redis.module';
import { ConversationModule } from '../conversation/conversation.module'; // Import ConversationModule
import { RedisService } from '../redis/redis.service';
import { AppClientService } from '../sharedservices/AppClientService';
import { ChatServiceCallCenter } from '../sharedservices/ChatServiceCallCenter';
import { ChatServiceClient } from '../sharedservices/ChatServiceClient';
import { StorageService } from '../storage/storage.service';
import { ChatGatewayCallCenter } from './ChatGatewayCallCenter';
import { ChatGatewayWidget } from './ChatGatewayWidget';
import { ChatWidgetController } from './ChatWidgetController';
import { ChatCallCenterController } from './ChatCallCenterController';
import { ClientController } from './ClientController';
import { ConversationSchema,ConversationDocument, Conversation } from '../conversation/entities/conversation.entity';
import { UserDeviceInfo, UserDeviceInfoSchema } from '../models/UserDeviceInfo';
import { ConversationService } from '../conversation/conversation.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule,
    ConversationModule, 
    MongooseModule.forFeature([
      { name: AppClient.name, schema: AppClientSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: UserDeviceInfo.name, schema: UserDeviceInfoSchema }
    ]),
  ], 
  providers: [
    AppClientService,
    ChatGatewayWidget,
    ChatServiceCallCenter,
    ChatServiceClient,
    StorageService,
    RedisService,
    ChatGatewayCallCenter,
    ConversationService
  ],
  controllers: [
    ChatWidgetController,
    ChatCallCenterController,
    ClientController,
  ],
  exports: [],
})
export class ChatModule {}

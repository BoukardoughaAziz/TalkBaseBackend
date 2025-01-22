import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@nestjs/config';
import { AppClient, AppClientSchema } from 'src/models/AppClientSchema';
import { ChatMessage, ChatMessageSchema } from 'src/models/ChatMessageSchema';
 
import { ChatControllerWidget } from './ChatControllerWidget';
import { ChatGatewayWidget } from './ChatGatewayWidget';
import { StorageService } from 'src/storage/storage.service';
import { RedisService } from 'src/redis/redis.service';
import { RedisModule } from 'src/redis/redis.module';
import { AppClientService } from 'src/sharedservices/AppClientService';
import { ChatServiceClient } from 'src/sharedservices/ChatServiceClient';
import { ChatGatewayCallCenter } from './ChatGatewayCallCenter';
import { ChatServiceCallCenter } from 'src/sharedservices/ChatServiceCallCenter';
import { ChatControllerCallCenter } from './ChatControllerCallCenter';
 

@Module({
  imports: [ConfigModule.forRoot(), RedisModule,
    MongooseModule.forFeature([
      { name: AppClient.name, schema: AppClientSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ], // Ensure this line is correct
  providers: [AppClientService, ChatGatewayWidget, ChatServiceCallCenter,ChatServiceClient,StorageService,RedisService,ChatGatewayCallCenter],
  controllers: [ChatControllerWidget,ChatControllerCallCenter],
  exports: [], // Exporting the service if you want to use it in other modules
})
export class ChatModule {}

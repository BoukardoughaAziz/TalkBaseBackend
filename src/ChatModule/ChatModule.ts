import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatMessage, ChatMessageSchema } from 'src/models/ChatMessageSchema';
import { ChatService } from 'src/services/ChatService';
import { ChatGatewayWidget } from './ChatGatewayWidget';
import { ChatController } from './ChatController';
import { AppClientService } from 'src/services/AppClientService';
import { AppClient, AppClientSchema } from 'src/models/AppClientSchema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: AppClient.name, schema: AppClientSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ], // Ensure this line is correct
  providers: [AppClientService, ChatGatewayWidget, ChatService],
  controllers: [ChatController],
  exports: [], // Exporting the service if you want to use it in other modules
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { BaseBuddyService } from './base-buddy.service';
import { BaseBuddyController } from './base-buddy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/conversation/entities/conversation.entity';
import { ChatMessage, ChatMessageSchema } from 'src/models/ChatMessageSchema';
import { AppClient, AppClientSchema } from 'src/models/AppClientSchema';
import { ClientInformation } from 'src/models/ClientInformationSchema';
import { ClientInformationSchema } from 'src/client-information/schemas/client-information.schema';

@Module({
  controllers: [BaseBuddyController],
  providers: [BaseBuddyService],
  imports:[    
    MongooseModule.forFeature([
        { name: Conversation.name, schema: ConversationSchema },
        { name: ChatMessage.name, schema: ChatMessageSchema },
        { name: AppClient.name, schema: AppClientSchema },
        { name: ClientInformation.name, schema: ClientInformationSchema },
      ]),]
})
export class BaseBuddyModule {}

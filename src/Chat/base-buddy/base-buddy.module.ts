import { Module } from '@nestjs/common';
import { BaseBuddyService } from './base-buddy.service';
import { BaseBuddyController } from './base-buddy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../../conversation/entities/conversation.entity';
import { ChatMessage, ChatMessageSchema } from '../../models/ChatMessageSchema';
import { AppClient, AppClientSchema } from '../../models/AppClientSchema';
import { ClientInformation } from '../../models/ClientInformationSchema';
import { ClientInformationSchema } from '../../client-information/schemas/client-information.schema';

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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { AppAgent, AppAgentSchema } from 'src/models/AppAgentSchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema }, 
      { name: AppAgent.name, schema: AppAgentSchema },  
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [MongooseModule],
})
export class ConversationModule {}

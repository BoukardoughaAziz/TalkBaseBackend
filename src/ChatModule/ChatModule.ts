import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
 
import { ChatMessage, ChatMessageSchema } from 'src/models/ChatMessageSchema';
import { ChatService } from 'src/services/ChatService';
import { ChatGateway } from './ChatGateway';
import { ChatController } from './ChatController';
 

@Module({
  imports: [MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }])], // Ensure this line is correct
  providers: [ChatGateway, ChatService],
  controllers:[ChatController],
  exports: [ChatService], // Exporting the service if you want to use it in other modules
})
export class ChatModule {}

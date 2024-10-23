// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import ChatEvent from './ChatEvent';
import ChatDirection from './ChatDirection';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true, enum: ChatEvent })
  chatEvent: ChatEvent;  // User ID or username

  @Prop({ required: true, enum: ChatDirection })
  chatDirection: ChatDirection;

  @Prop({ required: false })
  appClientIdentifier: string;  // ID of the chat room this message belongs to

 

   
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

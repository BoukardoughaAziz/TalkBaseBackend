// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import ChatEvent from './ChatEvent';
import ChatDirection from './ChatDirection';
import { AppClient } from './AppClientSchema';
import { SenderType } from './SenderType';
import { AppAgent } from './AppAgentSchema';
import { MessageReaction } from './MessageReaction';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({
  timestamps: { createdAt: 'timestamp', updatedAt: 'editedAt' },
  collection: 'ChatMessage'
})
export class ChatMessage {
   _id: string;
  @Prop({ required: true, enum: ChatEvent })
  chatEvent: ChatEvent; 

  @Prop({ required: true, enum: ChatDirection })
  chatDirection: ChatDirection;

  @Prop({ required: true })
  senderType: SenderType;

  @Prop({ required: false, type: Object })
  messageRecation: MessageReaction;

  @Prop({ required: false })
  message: string;

  @Prop({ required: false })
  appClient: AppClient;

  @Prop({ required: false })
  appAgent: AppAgent;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  conversationId: string;

  @Prop({ required: false, default: false })
  isSentBy_BB: boolean;

}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

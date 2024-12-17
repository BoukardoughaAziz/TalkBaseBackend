// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import ChatEvent from './ChatEvent';
import ChatDirection from './ChatDirection';
import { AppClient } from './AppClientSchema';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true, enum: ChatEvent })
  chatEvent: ChatEvent; // User ID or username

  @Prop({ required: true, enum: ChatDirection })
  chatDirection: ChatDirection;

  @Prop({ required: false })
  ipAddress: string;
  @Prop({ type: Types.ObjectId, ref: 'AppClient', required: false })
  appClient: Types.ObjectId | AppClient;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

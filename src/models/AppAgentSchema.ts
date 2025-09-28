// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Conversation } from '../conversation/entities/conversation.entity';

export type AppAgentDocument = AppAgent & Document;

export enum AgentType {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT'
}

@Schema({ timestamps: true, collection:"AppAgent" })
export class AppAgent {
  _id: string;
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, enum: AgentType, default: AgentType.AGENT })
  type: AgentType;

  @Prop({ required: true, default: true }) //change default to false afterwards!!!!
  isApproved: boolean;

  @Prop({ required: false, default: false })
  emailVerified: boolean;

  @Prop({ required: true })
  emailPin: number;
  
  @Prop({ required: false })
  SocketId: string;

  @Prop({ required: false })
  ConversationsIDs: string[];
}

export const AppAgentSchema = SchemaFactory.createForClass(AppAgent);

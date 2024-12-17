// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppAgentDocument = AppAgent & Document;

@Schema({ timestamps: true })
export class AppAgent {
  _id: string;
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const AppAgentSchema = SchemaFactory.createForClass(AppAgent);

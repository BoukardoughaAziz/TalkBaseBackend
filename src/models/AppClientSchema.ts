// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import AppOS from './AppOS';
import { AppAgent } from './AppAgentSchema';

export type AppClientDocument = AppClient & Document;

@Schema({ timestamps: true })
export class AppClient {
  @Prop({ required: true })
  identifier: string;
  

  @Prop({ required: false, enum: AppOS })
  os: AppOS;

  @Prop({ required: false })
  browser: string;

  @Prop({ required: false })
  ipAddress: string;
  @Prop({ type: Types.ObjectId, ref: 'AppAgent', required: false })
  associatedAgent:  Types.ObjectId | AppAgent;
 

}

export const AppClientSchema = SchemaFactory.createForClass(AppClient);

// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import AppOS from './AppOS';
import { AppAgent } from './AppAgentSchema';
import AppBrowser from './AppBrowser';

export type AppClientDocument = AppClient & Document;

@Schema({ timestamps: true, collection: 'AppClient' })
export class AppClient {
  @Prop({ required: true })
  identifier: string;
  @Prop({ required: false })
  humanIdentifier: string;

  @Prop({ required: false })
  ipAddress: string;

  @Prop({ required: false })
  country: string;
  
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'AppAgent', required: false })
  associatedAgent: Types.ObjectId | AppAgent;

  @Prop({ required: false })
  SocketId: string;

}

export const AppClientSchema = SchemaFactory.createForClass(AppClient);

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
  @Prop({ required: false, enum: AppOS })
  appOS: AppOS;

  @Prop({ required: false, enum: AppBrowser })
  appBrowser: AppBrowser;

  @Prop({ required: false })
  ipAddress: string;

  @Prop({ required: false })
  city: string;
  @Prop({ required: false })
  org: string; 

  @Prop({ required: false })
  countryCode: string;

  @Prop({ type: Types.ObjectId, ref: 'AppAgent', required: false })
  associatedAgent: Types.ObjectId | AppAgent;
}

export const AppClientSchema = SchemaFactory.createForClass(AppClient);

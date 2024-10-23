// schemas/chat-message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import AppOS from './AppOS';

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
}

export const AppClientSchema = SchemaFactory.createForClass(AppClient);

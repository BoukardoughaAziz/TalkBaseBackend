import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDeviceInfoDocument = UserDeviceInfo & Document;

@Schema({ timestamps: true })
export class UserDeviceInfo {
  @Prop()
  userIdentifier?: string;

  @Prop({ type: Object, required: false })
  appBrowser: { name: string; version: string };

  @Prop({ type: Object, required: false })
  appOs: { name: string; version: string };

  @Prop()
  cpuCores?: number;

  @Prop()
  deviceMemoryGB?: number;

  @Prop()
  screenWidth?: number;

  @Prop()
  screenHeight?: number;

  @Prop()
  pixelRatio?: number;

  @Prop()
  language?: string;

  @Prop()
  timezone?: string;

  @Prop()
  connectionType?: string;
}

export const UserDeviceInfoSchema = SchemaFactory.createForClass(UserDeviceInfo);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AppClient } from './AppClientSchema'; 

export type AppStatDocument = AppStat & Document;

@Schema({ timestamps: true, collection: 'AppStat' }) 
export class AppStat {
  @Prop({ required: true })
  duration: string;

  @Prop({ required: false })
  page: string;

  @Prop({ type: Types.ObjectId, ref: 'AppClient', required: true })
  appClient: Types.ObjectId | AppClient;
}

export const AppStatSchema = SchemaFactory.createForClass(AppStat);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientInformationDocument = ClientInformation & Document;

@Schema()
export class ClientInformation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  identifier:string

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  jobTitle: string;

  @Prop()
  notes: string;
}

export const ClientInformationSchema = SchemaFactory.createForClass(ClientInformation);

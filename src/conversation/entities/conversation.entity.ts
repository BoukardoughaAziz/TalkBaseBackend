import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatMessage } from '../../models/ChatMessageSchema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true, collection:"Conversation" })
export class Conversation {

    @Prop({type: [{type: Types.ObjectId, ref: 'Message'}]})
    messages: ChatMessage[];

    @Prop({ required: true })
    AppClientID:string

}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
 
import {  Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrentPageInfoDocument = CurrentPageInfo & Document;

@Schema({ timestamps: true, collection:"CurrentPageInfo" })
export class CurrentPageInfo {
    
@Prop({ required: true })
  pageUrl: string;
 
  @Prop({ required: true })
  actionType: 'view' | 'click' | 'scroll' | 'add_to_cart' | 'purchase';

  // @Prop({ required: true })
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productCategory: 'clothes' | 'pc' | 'furniture' | 'utensils' | 'other';

  @Prop()
  productName?: string;

  @Prop()
  productBrand?: string;

  @Prop()
  productPrice?: number;

  @Prop()
  productImageUrl?: string;

}

export const CurrentPageInfoSchema = SchemaFactory.createForClass(CurrentPageInfo);

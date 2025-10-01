import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ default: 'n/a' })
  currency: string;

  @Prop({ default: 'n/a' })
  color: string;

  @Prop({ type: [String], default: [] })
  availableSizes: string[];

  @Prop({ default: 'n/a' })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    enum: ['Clothing', 'Electronics', 'Home', 'Beauty', 'Sports', 'Other', 'n/a'],
    default: 'Other',
  })
  category: string;

  @Prop({ default: 'n/a' })
  brand: string;

  @Prop({ default: 'n/a' })
  availability: string;

  @Prop({
    enum: ['yes', 'no', 'n/a'],
    default: 'no',
  })
  discount: string;

  @Prop({ required: true })
  scrapedAt: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

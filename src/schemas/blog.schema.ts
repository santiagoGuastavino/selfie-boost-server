import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema()
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  userId: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from './user.schema';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true, versionKey: false })
export class Blog {
  @Prop({
    required: true,
    nullable: false,
  })
  title: string;

  @Prop({
    required: false,
    nullable: true,
    default: null,
  })
  description: string;

  @Prop({
    required: true,
    nullable: false,
  })
  imageUrl: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  user: ObjectId;

  @Prop({ required: true })
  name: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

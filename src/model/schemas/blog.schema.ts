import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from './user.schema';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: false, versionKey: false })
export class Blog {
  @Prop({
    type: String,
    required: true,
    nullable: false,
  })
  title: string;

  @Prop({
    type: String,
    required: false,
    nullable: true,
    default: null,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
    nullable: false,
  })
  image: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    nullable: false,
  })
  user: ObjectId;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

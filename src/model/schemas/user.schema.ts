import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({
    required: true,
    unique: true,
    nullable: false,
  })
  email: string;

  @Prop({
    required: true,
    nullable: false,
  })
  password: string;

  @Prop({
    required: true,
    nullable: false,
  })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: false, versionKey: false })
export class User {
  @Prop({
    type: String,
    required: true,
    nullable: false,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    nullable: false,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    nullable: false,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    nullable: false,
  })
  lastName: string;

  @Prop({
    type: Number,
    required: true,
    nullable: false,
  })
  activationCode: number;

  @Prop({
    type: Boolean,
    required: false,
    nullable: true,
    default: false,
  })
  activated: boolean;

  @Prop({
    type: Number,
    required: true,
    nullable: false,
  })
  passwordRecoveryCode: number;

  @Prop({
    type: Number,
    required: false,
    nullable: true,
    default: null,
  })
  lastRefreshToken: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

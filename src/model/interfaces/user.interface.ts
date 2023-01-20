import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  activationCode: number;
  activated: boolean;
  passwordRecoveryCode: number;
  lastRefreshToken: number;
}

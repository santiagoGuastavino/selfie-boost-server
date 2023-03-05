import { ObjectId } from 'mongodb';

export interface JwtPayload {
  _id: ObjectId;
  timestamp?: number;
}

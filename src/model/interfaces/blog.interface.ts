import { ObjectId } from 'mongodb';
import { User } from '../schemas/user.schema';

export interface IBlog {
  _id: ObjectId;
  title: string;
  description: string | null;
  imageUrl: string;
  user: ObjectId;
}

export interface IPopulatedUserDoc extends Omit<IBlog, 'user'> {
  user: User;
}

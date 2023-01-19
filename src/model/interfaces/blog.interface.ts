import { ObjectId } from 'mongodb';
import { User } from '../schemas/user.schema';

export interface IBlog {
  _id: ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  user: ObjectId;
  name: string;
}

export interface IPopulatedUserDoc extends Omit<IBlog, 'user'> {
  user: User;
}

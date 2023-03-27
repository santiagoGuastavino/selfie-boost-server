import { ObjectId } from 'mongodb';

export class BlogsUserPopulated {
  _id: ObjectId;
  title: string;
  description: null | string;
  image: string;
  user: UserPopulates;
}

class UserPopulates {
  _id: ObjectId;
  firstName: string;
  lastName: string;
}

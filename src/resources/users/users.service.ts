import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { IUser } from 'src/model/interfaces/user.interface';
import { User } from 'src/model/schemas/user.schema';
import { SaveUser } from '../auth/dtos/signup.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private usersModel: Model<User>) {}

  async findOne(filter: FilterQuery<User>): Promise<IUser> {
    return await this.usersModel.findOne(filter).lean();
  }

  async create(payload: SaveUser): Promise<IUser> {
    return await this.usersModel.create(payload);
  }

  async update(
    filter: FilterQuery<User>,
    update: UpdateQuery<User>,
  ): Promise<void> {
    await this.usersModel.findOneAndUpdate(filter, update);
  }
}

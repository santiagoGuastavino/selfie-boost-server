import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, UpdateQuery } from 'mongoose';
import { IBlog } from 'src/model/interfaces/blog.interface';
import { Blog } from 'src/model/schemas/blog.schema';
import { BlogsUserPopulated } from './dtos/read.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private blogsModel: Model<Blog>) {}

  async findOne(filter: FilterQuery<Blog>): Promise<IBlog> {
    return await this.blogsModel.findOne(filter).select({ user: 0 }).lean();
  }

  async create(payload: any): Promise<void> {
    await this.blogsModel.create(payload);
  }

  async update(
    filter: FilterQuery<Blog>,
    update: UpdateQuery<Blog>,
  ): Promise<void> {
    await this.blogsModel.findOneAndUpdate(filter, update);
  }

  async delete(filter: FilterQuery<Blog>): Promise<void> {
    await this.blogsModel.deleteOne(filter);
  }

  async findAll(): Promise<BlogsUserPopulated[]> {
    const pipeline: PipelineStage[] = [];

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$user',
          includeArrayIndex: '0',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          user: 1,
        },
      },
    );

    return await this.blogsModel.aggregate(pipeline);
  }

  async findByField(filter: FilterQuery<Blog>): Promise<IBlog[]> {
    return await this.blogsModel.find(filter).select({ user: 0 }).lean();
  }
}

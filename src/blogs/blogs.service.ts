import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from 'src/schemas/blog.schema';
import { CreateBlogDto } from './dtos/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}

  async createBlog(payload: CreateBlogDto) {
    return 'hello';
  }
}

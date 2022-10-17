import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exceptions } from 'src/common/enums/exceptions.enum';
import { Blog } from 'src/schemas/blog.schema';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { DeleteBlogDto } from './dtos/delete-blog.dto';
import { ReadOneBlogDto } from './dtos/read-one-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogsModel: Model<Blog>,
  ) {}

  async createBlog(payload: CreateBlogDto, req: any) {
    const blogToBeCreated = new this.blogsModel({
      ...payload,
      userId: req.user._id,
    });

    await blogToBeCreated.save();

    return {
      statusCode: HttpStatus.CREATED,
      message: 'CREATED',
    };
  }

  async readAllBlogs() {
    const blogs = await this.blogsModel.find();

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      payload: blogs,
    };
  }

  async readOneBlog(param: ReadOneBlogDto) {
    const blog = await this.blogsModel.findById(param._id);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      payload: blog,
    };
  }

  async updateBlog(payload: UpdateBlogDto) {
    const blogToUpdate = await this.blogsModel.findByIdAndUpdate(payload._id, {
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
    });

    if (!blogToUpdate) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: [Exceptions.BLOG_NOT_FOUND],
        error: 'Not found',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  async deleteBlog(payload: DeleteBlogDto) {
    const blogToDelete = await this.blogsModel.findByIdAndDelete(payload._id);

    if (!blogToDelete) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: [Exceptions.BLOG_NOT_FOUND],
        error: 'Not found',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }
}

import {
  Injectable,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
    console.log(typeof req);
    const blogToBeCreated = new this.blogsModel({
      ...payload,
      userId: req.user._id,
      name: req.user.name,
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

  async updateBlog(payload: UpdateBlogDto, req: any) {
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

    if (blogToUpdate.userId !== req.user._id) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [Exceptions.CANT_UPDATE_BLOG],
        error: 'Forbidden',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  async deleteBlog(payload: DeleteBlogDto, req: any) {
    const blogToDelete = await this.blogsModel.findByIdAndDelete(payload._id);

    if (!blogToDelete) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: [Exceptions.BLOG_NOT_FOUND],
        error: 'Not found',
      });
    }

    if (blogToDelete.userId !== req.user._id) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: [Exceptions.CANT_UPDATE_BLOG],
        error: 'Forbidden',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  async readUserBlogs(req) {
    const userBlogs = await this.blogsModel.find({ userId: req.user._id });
    return userBlogs;
  }
}

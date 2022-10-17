import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { DeleteBlogDto } from './dtos/delete-blog.dto';
import { ReadOneBlogDto } from './dtos/read-one-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlog(@Body() payload: CreateBlogDto, @Request() req: any) {
    return this.blogsService.createBlog(payload, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async readAllBlogs() {
    return this.blogsService.readAllBlogs();
  }

  @Get(':_id')
  @UseGuards(JwtAuthGuard)
  async readOneBlog(@Param() payload: ReadOneBlogDto) {
    return this.blogsService.readOneBlog(payload);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateBlog(@Body() payload: UpdateBlogDto) {
    return this.blogsService.updateBlog(payload);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteBlog(@Body() payload: DeleteBlogDto) {
    return this.blogsService.deleteBlog(payload);
  }
}

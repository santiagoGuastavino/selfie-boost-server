import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlog(@Body() payload: CreateBlogDto) {
    return this.blogsService.createBlog(payload);
  }
}

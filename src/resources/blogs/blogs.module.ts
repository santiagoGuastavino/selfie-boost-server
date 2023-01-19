import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from 'src/model/schemas/blog.schema';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}

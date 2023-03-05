import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AWSModule } from 'src/common/services/aws/aws.module';
import { Blog, BlogSchema } from 'src/model/schemas/blog.schema';
import { UsersModule } from '../users/users.module';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    UsersModule,
    AWSModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}

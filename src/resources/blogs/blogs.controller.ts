import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Patch,
  Delete,
  Param,
  InternalServerErrorException,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { HttpCode } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import { Logger } from '@nestjs/common/services';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, SaveBlog } from './dtos/create-blog.dto';
import { ReadOneByIdDto } from './dtos/read-one.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { ObjectId } from 'mongodb';
import { IBlog } from 'src/model/interfaces/blog.interface';
import { I18n, I18nContext } from 'nestjs-i18n';
import { TransformToBufferPipe } from 'src/common/pipes/transform-to-buffer.pipe';
import { UsersService } from '../users/users.service';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { AWSService } from 'src/services/aws/aws.service';
import { BlogsUserPopulated } from './dtos/blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private usersService: UsersService,
    private awsService: AWSService,
  ) {}

  /*
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(TransformToBufferPipe) payload: CreateBlogDto,
    @Req() req: any,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.CREATED, 'Created');
    const user: JwtPayload = req.user;

    try {
      const imageUrl: string = await this.awsService.uploadToS3(
        payload.buffer,
        `blog-image-${user._id}-${payload.title}`,
      );

      const newBlog: SaveBlog = {
        ...payload,
        image: imageUrl,
        user: new ObjectId(user._id),
      };

      await this.blogsService.create(newBlog);

      return response;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async readAll(): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const blogs: BlogsUserPopulated[] = await this.blogsService.findAll();

      response.payload = blogs;

      return response;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async readByUser(@Req() req: any): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');
    const user: JwtPayload = req.user;

    try {
      const blogsByUser: IBlog[] = await this.blogsService.findMany({
        user: new ObjectId(user._id),
      });

      response.payload = blogsByUser;

      return response;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async readOneById(
    @Param() param: ReadOneByIdDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const blog: IBlog = await this.blogsService.findOne({ _id: param.id });

      if (!blog) throw new Error(Exceptions.NOT_FOUND);

      response.payload = blog;

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'blog',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'blog',
                  },
                }),
              },
            },
          ],
        });
      } else {
        Logger.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @Body(TransformToBufferPipe) payload: UpdateBlogDto,
    @Req() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');
    const user: JwtPayload = req.user;

    try {
      const blogToBeUpdated = await this.blogsService.findOne({
        _id: payload._id,
      });

      if (!blogToBeUpdated) throw new Error(Exceptions.NOT_FOUND);

      const userToUpdate = await this.usersService.findOne({ _id: user._id });

      if (blogToBeUpdated.user !== userToUpdate._id)
        throw new Error(Exceptions.FORBIDDEN);

      await this.blogsService.update({ _id: blogToBeUpdated._id }, payload);

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'blog',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'blog',
                  },
                }),
              },
            },
          ],
        });
      } else if (error.message === Exceptions.FORBIDDEN) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          errors: [
            {
              property: 'user',
              children: [],
              constraints: {
                WRONG_USER: i18n.t('exceptions.WRONG_USER'),
              },
            },
          ],
        });
      } else {
        Logger.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteBlog(
    @Body() payload: ReadOneByIdDto,
    @Req() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');
    const user: JwtPayload = req.user;

    try {
      const blogToBeDeleted = await this.blogsService.findOne({
        _id: payload.id,
      });

      if (!blogToBeDeleted) throw new Error(Exceptions.NOT_FOUND);

      const userDeleting = await this.usersService.findOne({ _id: user._id });

      if (blogToBeDeleted.user !== userDeleting._id)
        throw new Error(Exceptions.FORBIDDEN);

      await this.blogsService.delete({ _id: blogToBeDeleted._id });

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'blog',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'blog',
                  },
                }),
              },
            },
          ],
        });
      } else if (error.message === Exceptions.FORBIDDEN) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          errors: [
            {
              property: 'user',
              children: [],
              constraints: {
                WRONG_USER: i18n.t('exceptions.WRONG_USER'),
              },
            },
          ],
        });
      } else {
        Logger.error(error);
        throw new InternalServerErrorException();
      }
    }
  }
  */
}

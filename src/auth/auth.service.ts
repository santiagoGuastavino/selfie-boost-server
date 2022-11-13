import {
  Injectable,
  HttpStatus,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Exceptions } from 'src/common/enums/exceptions.enum';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(payload: LoginDto) {
    const { email, password } = payload;
    const userToLogin = await this.usersModel.findOne({
      email,
    });

    if (!userToLogin) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [Exceptions.EMAIL_NOT_FOUND],
        error: 'Bad request',
      });
    }

    const passwordsMatch = await bcrypt.compare(password, userToLogin.password);
    if (passwordsMatch) {
      const jwtPayload = { email: userToLogin.email, sub: userToLogin._id };
      const secret = process.env.JWT_SECRET;

      const token = this.jwtService.sign(jwtPayload, {
        secret,
      });

      return {
        access_token: token,
      };
    } else {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: [Exceptions.PASSWORDS_DO_NOT_MATCH],
        error: 'Conflict',
      });
    }
  }

  async signup(payload: SignupDto) {
    try {
      const { email, password, name } = payload;

      const userToBeCreated = await this.usersModel.findOne({
        email,
      });

      if (userToBeCreated) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: [Exceptions.EMAIL_ALREADY_IN_USE],
          error: 'Conflict',
        });
      } else {
        const newUser = await this.usersModel.create({
          email,
          password: await bcrypt.hash(password, 10),
          name,
        });

        await newUser.save();

        const jwtPayload = { email: newUser.email, sub: newUser._id };
        const secret = process.env.JWT_SECRET;

        const token = this.jwtService.sign(jwtPayload, {
          secret,
        });

        return {
          access_token: token,
        };
      }
    } catch (error) {
      Logger.error(error);

      if (error.code === 11000) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: [Exceptions.EMAIL_ALREADY_IN_USE],
          error: 'Conflict',
        });
      }
    }
  }
}

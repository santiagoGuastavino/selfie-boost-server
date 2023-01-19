import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { UserService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() payload: LoginDto): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      // return this.authService.login(payload);
      return response;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() payload: SignupDto) {
    return this.authService.signup(payload);
  }
}

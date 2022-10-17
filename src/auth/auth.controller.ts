import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('signup')
  async signup(@Body() payload: SignupDto) {
    return this.authService.signup(payload);
  }
}

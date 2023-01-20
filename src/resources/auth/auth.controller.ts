import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { I18n } from 'nestjs-i18n/dist/decorators/i18n.decorator';
import { I18nContext } from 'nestjs-i18n/dist/i18n.context';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { ThrowError } from 'src/common/enums/throw-error.enum';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { IUser } from 'src/model/interfaces/user.interface';
import { UserService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ActivateAccountDto } from './dtos/activate-account.dto';
import { LoginDto } from './dtos/login.dto';
import { SendCodeDto } from './dtos/send-code.dto';
import { SetForgottenPasswordDto } from './dtos/set-forgotten-password.dto';
import { SignupDto, SaveUser } from './dtos/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // TO DO
  // signup email (activation code)
  // send-activation-code endpoint email
  // send-password-recovery-code endpoint email

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: LoginDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userToLogin: IUser = await this.userService.findOne({
        email: payload.email,
      });

      if (!userToLogin) throw new Error(ThrowError.USER_NOT_FOUND);
      if (userToLogin.activated !== true)
        throw new Error(ThrowError.NOT_ACTIVATED);

      const passwordsMatch = await this.authService.matchPasswords(
        payload.password,
        userToLogin.password,
      );

      if (!passwordsMatch) throw new Error(ThrowError.WRONG_CREDENTIALS);

      const jwtPayload: JwtPayload = {
        _id: userToLogin._id,
      };

      const timestamp: number = new Date().getTime();

      const accessToken: string =
        this.authService.generateAccessToken(jwtPayload);
      const refreshToken: string = this.authService.generateRefreshToken(
        jwtPayload,
        timestamp,
      );

      await this.userService.update(
        { _id: userToLogin._id },
        { lastRefreshToken: timestamp },
      );

      response.payload = {
        access_token: accessToken,
        refresh_token: refreshToken,
      };

      return response;
    } catch (error) {
      if (error.message === ThrowError.USER_NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'email',
                  },
                }),
              },
            },
          ],
        });
      } else if (error.message === ThrowError.NOT_ACTIVATED) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                NOT_ACTIVATED: i18n.t('exceptions.NOT_ACTIVATED'),
              },
            },
          ],
        });
      } else if (error.message === ThrowError.WRONG_CREDENTIALS) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'password',
              children: [],
              constraints: {
                WRONG_CREDENTIALS: i18n.t('exceptions.WRONG_CREDENTIALS'),
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

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() payload: SignupDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.CREATED, 'Created');

    try {
      const userExists: IUser = await this.userService.findOne({
        email: payload.email,
      });

      if (userExists) throw new Error(ThrowError.ALREADY_EXISTS);

      const hashedPassword: string = await this.authService.hashPassword(
        payload.password,
      );

      const newUser: SaveUser = {
        email: payload.email,
        password: hashedPassword,
        firstName: payload.firstName,
        lastName: payload.lastName,
        activationCode: Math.floor(100000 + Math.random() * 900000),
        passwordRecoveryCode: Math.floor(100000 + Math.random() * 900000),
      };

      await this.userService.create(newUser);

      // send activation code e-mail

      response.payload.message = 'User created.';

      return response;
    } catch (error) {
      if (error.message === ThrowError.ALREADY_EXISTS) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                ALREADY_EXISTS: i18n.t('exceptions.ALREADY_EXISTS', {
                  args: {
                    property: 'email',
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

  @Post('activate-account')
  @HttpCode(HttpStatus.OK)
  async activateAccount(
    @Body() payload: ActivateAccountDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userToActivate: IUser = await this.userService.findOne({
        email: payload.email,
      });

      if (!userToActivate) throw new Error(ThrowError.USER_NOT_FOUND);
      if (userToActivate.activated === true)
        throw new Error(ThrowError.ALREADY_ACTIVATED);
      if (userToActivate.activationCode !== payload.activationCode)
        throw new Error(ThrowError.NO_MATCH);

      const jwtPayload: JwtPayload = {
        _id: userToActivate._id,
      };

      const timestamp: number = new Date().getTime();

      const accessToken: string =
        this.authService.generateAccessToken(jwtPayload);
      const refreshToken: string = this.authService.generateRefreshToken(
        jwtPayload,
        timestamp,
      );

      await this.userService.update(
        { _id: userToActivate._id },
        {
          activationCode: Math.floor(100000 + Math.random() * 900000),
          activated: true,
          lastRefreshToken: timestamp,
        },
      );

      response.payload = {
        access_token: accessToken,
        refresh_token: refreshToken,
      };

      return response;
    } catch (error) {
      if (error.message === ThrowError.USER_NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'email',
                  },
                }),
              },
            },
          ],
        });
      } else if (error.message === ThrowError.ALREADY_ACTIVATED) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                ALREADY_ACTIVATED: i18n.t('exceptions.ALREADY_ACTIVATED'),
              },
            },
          ],
        });
      } else if (error.message === ThrowError.NO_MATCH) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'activationCode',
              children: [],
              constraints: {
                WRONG_ACTIVATION_CODE: i18n.t(
                  'exceptions.WRONG_ACTIVATION_CODE',
                  { args: { code: payload.activationCode } },
                ),
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

  @Post('set-forgotten-password')
  @HttpCode(HttpStatus.OK)
  async setForgottenPassword(
    @Body() payload: SetForgottenPasswordDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userToRenewPassword: IUser = await this.userService.findOne({
        email: payload.email,
      });

      if (!userToRenewPassword) throw new Error(ThrowError.USER_NOT_FOUND);
      if (
        userToRenewPassword.passwordRecoveryCode !==
        payload.passwordRecoveryCode
      )
        throw new Error(ThrowError.NO_MATCH);

      const passwordsMatch: boolean = await this.authService.matchPasswords(
        payload.password,
        userToRenewPassword.password,
      );

      if (passwordsMatch) throw new Error(ThrowError.SAME_PASSWORD);

      const hashedPassword: string = await this.authService.hashPassword(
        payload.password,
      );

      await this.userService.update(
        { email: userToRenewPassword.email },
        {
          password: hashedPassword,
          passwordRecoveryCode: Math.floor(100000 + Math.random() * 900000),
        },
      );

      return response;
    } catch (error) {
      if (error.message === ThrowError.USER_NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'email',
                  },
                }),
              },
            },
          ],
        });
      } else if (error.message === ThrowError.NO_MATCH) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'passwordRecoveryCode',
              children: [],
              constraints: {
                WRONG_PASSWORD_RECOVERY_CODE: i18n.t(
                  'exceptions.WRONG_PASSWORD_RECOVERY_CODE',
                  { args: { code: payload.passwordRecoveryCode } },
                ),
              },
            },
          ],
        });
      } else if (error.message === ThrowError.SAME_PASSWORD) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          errors: [
            {
              property: 'password',
              children: [],
              constraints: {
                SAME_PASSWORD: i18n.t('exceptions.SAME_PASSWORD'),
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

  @Post('send-activation-code')
  @HttpCode(HttpStatus.OK)
  async sendActivationCode(
    @Body() payload: SendCodeDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userRequiringCode: IUser = await this.userService.findOne({
        email: payload.email,
      });

      if (!userRequiringCode) throw new Error(ThrowError.USER_NOT_FOUND);

      // send email with code

      response.payload.message = 'Email sent';

      return response;
    } catch (error) {
      if (error.message === ThrowError.USER_NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'email',
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

  @Post('send-password-recovery-code')
  @HttpCode(HttpStatus.OK)
  async sendPasswordRecoveryCode(
    @Body() payload: SendCodeDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userRequiringCode: IUser = await this.userService.findOne({
        email: payload.email,
      });

      if (!userRequiringCode) throw new Error(ThrowError.USER_NOT_FOUND);

      // send email with code

      response.payload.message = 'Email sent';

      return response;
    } catch (error) {
      if (error.message === ThrowError.USER_NOT_FOUND) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          errors: [
            {
              property: 'email',
              children: [],
              constraints: {
                NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                  args: {
                    property: 'email',
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
}

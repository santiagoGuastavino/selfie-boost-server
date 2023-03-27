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
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { I18n } from 'nestjs-i18n/dist/decorators/i18n.decorator';
import { I18nContext } from 'nestjs-i18n/dist/i18n.context';
import { ObjectId } from 'mongodb';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { ActivateAccountDto } from './dtos/activate-account.dto';
import { LoginDto } from './dtos/login.dto';
import { SendCodeDto } from './dtos/send-code.dto';
import { SetForgottenPasswordDto } from './dtos/set-forgotten-password.dto';
import { SignupDto } from './dtos/signup.dto';
import { SaveUser } from '../users/dtos/save-user.dto';
import { Exceptions } from 'src/common/enums/exceptions.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { IUser } from 'src/model/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshAccessTokenDto } from './dtos/refresh-access-token.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { EmailService } from 'src/services/email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: LoginDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userToLogin: IUser = await this.usersService.findOne({
        email: payload.email,
      });

      if (!userToLogin) throw new Error(Exceptions.NOT_FOUND);
      if (userToLogin.activated !== true)
        throw new Error(Exceptions.NOT_ACTIVATED);

      const passwordsMatch = await this.authService.matchPasswords(
        payload.password,
        userToLogin.password,
      );

      if (!passwordsMatch) throw new Error(Exceptions.WRONG_CREDENTIALS);

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

      await this.usersService.updateOne(
        { _id: userToLogin._id },
        { lastRefreshToken: timestamp },
      );

      response.payload = {
        access_token: accessToken,
        refresh_token: refreshToken,
      };

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
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
      } else if (error.message === Exceptions.NOT_ACTIVATED) {
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
      } else if (error.message === Exceptions.WRONG_CREDENTIALS) {
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
      const userExists: IUser = await this.usersService.findOne({
        email: payload.email,
      });

      if (userExists) throw new Error(Exceptions.ALREADY_EXISTS);

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

      const savedUser: IUser = await this.usersService.create(newUser);

      await this.emailService.sendAuthEmail(savedUser, 'signup');

      return response;
    } catch (error) {
      if (error.message === Exceptions.ALREADY_EXISTS) {
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() payload: RefreshAccessTokenDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const refresh_token: string = payload.refresh_token;

      const decodedJwtPayload: JwtPayload =
        await this.authService.decodeJwtPayload(refresh_token);

      const userId: ObjectId = decodedJwtPayload._id;
      const timestamp: number = decodedJwtPayload.timestamp;

      const userToRenewCredentials: IUser = await this.usersService.findOne({
        _id: userId,
      });

      if (userToRenewCredentials.lastRefreshToken !== timestamp)
        throw new Error(Exceptions.TOKEN_EXPIRED);

      const now: number = new Date().getTime();
      const diffTime: number = Math.abs(timestamp - now);
      const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const expireAfterDays: number = parseInt(
        process.env.JWT_REFRESH_TOKEN_TIME.match(/\d+/)[0],
      );

      if (diffDays > expireAfterDays) throw new Error(Exceptions.TOKEN_EXPIRED);

      await this.usersService.updateOne(
        { _id: userToRenewCredentials._id },
        { lastRefreshToken: now },
      );

      const newCredentials: JwtPayload = {
        _id: userToRenewCredentials._id,
      };

      const accessToken: string =
        this.authService.generateAccessToken(newCredentials);
      const refreshToken: string = this.authService.generateRefreshToken(
        newCredentials,
        now,
      );

      response.payload = {
        access_token: accessToken,
        refresh_token: refreshToken,
      };

      return response;
    } catch (error) {
      if (error.message === Exceptions.TOKEN_EXPIRED) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
          errors: [
            {
              property: 'refresh_token',
              constraints: {
                REFRESH_TOKEN_EXPIRED: i18n.t(
                  'exceptions.REFRESH_TOKEN_EXPIRED',
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

  @Post('activate-account')
  @HttpCode(HttpStatus.OK)
  async activateAccount(
    @Body() payload: ActivateAccountDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');

    try {
      const userToActivate: IUser = await this.usersService.findOne({
        email: payload.email,
      });

      if (!userToActivate) throw new Error(Exceptions.NOT_FOUND);
      if (userToActivate.activated === true)
        throw new Error(Exceptions.ALREADY_ACTIVATED);
      if (userToActivate.activationCode !== Number(payload.activationCode))
        throw new Error(Exceptions.NO_MATCH);

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

      const newCode = Math.floor(100000 + Math.random() * 900000);

      await this.usersService.updateOne(
        { _id: userToActivate._id },
        {
          activationCode: newCode,
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
      if (error.message === Exceptions.NOT_FOUND) {
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
      } else if (error.message === Exceptions.ALREADY_ACTIVATED) {
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
      } else if (error.message === Exceptions.NO_MATCH) {
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
      const userToRenewPassword: IUser = await this.usersService.findOne({
        email: payload.email,
      });

      if (!userToRenewPassword) throw new Error(Exceptions.NOT_FOUND);
      if (
        userToRenewPassword.passwordRecoveryCode !==
        Number(payload.passwordRecoveryCode)
      )
        throw new Error(Exceptions.NO_MATCH);

      const passwordsMatch: boolean = await this.authService.matchPasswords(
        payload.password,
        userToRenewPassword.password,
      );

      if (passwordsMatch) throw new Error(Exceptions.SAME_PASSWORD);

      const hashedPassword: string = await this.authService.hashPassword(
        payload.password,
      );

      const newCode = Math.floor(100000 + Math.random() * 900000);

      await this.usersService.updateOne(
        { email: userToRenewPassword.email },
        {
          password: hashedPassword,
          passwordRecoveryCode: newCode,
        },
      );

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
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
      } else if (error.message === Exceptions.NO_MATCH) {
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
      } else if (error.message === Exceptions.SAME_PASSWORD) {
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
      const userRequiringCode: IUser = await this.usersService.findOne({
        email: payload.email,
      });

      if (!userRequiringCode) throw new Error(Exceptions.NOT_FOUND);
      if (userRequiringCode.activated)
        throw new Error(Exceptions.ALREADY_ACTIVATED);

      const newCode = Math.floor(100000 + Math.random() * 900000);

      const updatedUser: IUser = await this.usersService.updateOne(
        { _id: userRequiringCode._id },
        {
          activationCode: newCode,
        },
      );

      await this.emailService.sendAuthEmail(updatedUser, 'activation-code');

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
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
      } else if (error.message === Exceptions.ALREADY_ACTIVATED) {
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
      const userRequiringCode: IUser = await this.usersService.findOne({
        email: payload.email,
      });

      if (!userRequiringCode) throw new Error(Exceptions.NOT_FOUND);
      if (userRequiringCode.activated === false)
        throw new Error(Exceptions.NOT_ACTIVATED);

      const newCode = Math.floor(100000 + Math.random() * 900000);

      const updatedUser: IUser = await this.usersService.updateOne(
        { _id: userRequiringCode._id },
        {
          passwordRecoveryCode: newCode,
        },
      );

      await this.emailService.sendAuthEmail(updatedUser, 'password-recovery');

      return response;
    } catch (error) {
      if (error.message === Exceptions.NOT_FOUND) {
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
      } else if (error.message === Exceptions.NOT_ACTIVATED) {
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
      } else {
        Logger.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() payload: ChangePasswordDto,
    @Req() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const response = new ResponseDto(HttpStatus.OK, 'Ok');
    const user: JwtPayload = req.user;

    try {
      const userToChangePassword = await this.usersService.findOne({
        _id: user._id,
      });

      const passwordsMatch: boolean = await this.authService.matchPasswords(
        payload.password,
        userToChangePassword.password,
      );

      if (passwordsMatch) throw new Error(Exceptions.SAME_PASSWORD);

      const hashedPassword: string = await this.authService.hashPassword(
        payload.password,
      );

      await this.usersService.updateOne(
        { _id: user._id },
        {
          password: hashedPassword,
          passwordRecoveryCode: Math.floor(100000 + Math.random() * 900000),
        },
      );

      return response;
    } catch (error) {
      if (error.message === Exceptions.SAME_PASSWORD) {
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
}

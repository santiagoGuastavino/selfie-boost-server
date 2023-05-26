import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseDto, ResponseMessage } from 'src/common/dtos/response.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { LoginDto } from './dtos/request/login.dto';
import { UsersService } from '../users/users.service';
import { IUser } from 'src/model/interfaces/user.interface';
import { NotFoundException } from 'src/common/exceptions/NotFound.exception';
import { I18nContext } from 'nestjs-i18n';
import { NotActivatedException } from 'src/resources/auth/exceptions/NotActivated.exception';
import { WrongPasswordException } from 'src/resources/auth/exceptions/WrongPassword.exception';
import { SignupDto } from './dtos/request/signup.dto';
import { AccessTokensDto } from './dtos/response/access-tokens.dto';
import { AlreadyExistsException } from 'src/common/exceptions/AlreadyExists.exception';
import { SaveUser } from '../users/dtos/save-user.dto';
import { EmailService } from 'src/services/email/email.service';
import { RefreshAccessTokenDto } from './dtos/request/refresh-access-token.dto';
import { CredentialsExpiredException } from './exceptions/CredentialsExpired.exception';
import { ObjectId } from 'mongodb';
import { ActivateAccountDto } from './dtos/request/activate-account.dto';
import { AlreadyActivatedException } from './exceptions/AlreadyActivated.exception';
import { WrongCodeException } from './exceptions/WrongCode.exception';
import { SetForgottenPasswordDto } from './dtos/request/set-forgotten-password.dto';
import { SamePasswordException } from './exceptions/SamePassword.exception';
import { SendCodeDto } from './dtos/request/send-code.dto';
import { FilterQuery } from 'mongoose';
import { User } from 'src/model/schemas/user.schema';
import { ChangePasswordDto } from './dtos/request/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  public async login(
    payload: LoginDto,
    i18n: I18nContext,
  ): Promise<ResponseDto<AccessTokensDto>> {
    const response = new ResponseDto<AccessTokensDto>(
      HttpStatus.OK,
      ResponseMessage.OK,
    );

    const userToLogin: IUser = await this.usersService.findOne({
      email: payload.email,
    });

    if (!userToLogin) throw new NotFoundException(i18n, 'user');

    if (!userToLogin.activated) throw new NotActivatedException(i18n);

    const passwordsMatch = await this.matchPasswords(
      payload.password,
      userToLogin.password,
    );

    if (!passwordsMatch) throw new WrongPasswordException(i18n);

    const jwtPayload: JwtPayload = {
      _id: userToLogin._id,
    };

    const now: number = new Date().getTime();

    const accessToken: string = this.generateAccessToken(jwtPayload);
    const refreshToken: string = this.generateRefreshToken(jwtPayload, now);

    await this.usersService.updateOne(
      { _id: userToLogin._id },
      { lastRefreshToken: now },
    );

    const responsePayload: AccessTokensDto = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    response.payload = responsePayload;

    return response;
  }

  public async signup(
    payload: SignupDto,
    i18n: I18nContext,
  ): Promise<ResponseDto<object>> {
    const response = new ResponseDto<object>(
      HttpStatus.CREATED,
      ResponseMessage.CREATED,
    );

    const userExists: IUser = await this.usersService.findOne({
      email: payload.email,
    });

    if (userExists) throw new AlreadyExistsException(i18n, 'email');

    const hashedPassword: string = await this.hashPassword(payload.password);

    const newUser: SaveUser = {
      email: payload.email,
      password: hashedPassword,
      firstName: payload.firstName,
      lastName: payload.lastName,
      activationCode: this.generateRandomNumber(),
      passwordRecoveryCode: this.generateRandomNumber(),
    };

    const savedUser: IUser = await this.usersService.insertAndReturn(newUser);

    await this.emailService.sendAuthEmail(savedUser, 'signup');

    return response;
  }

  public async refreshCredentials(
    payload: RefreshAccessTokenDto,
    i18n: I18nContext,
  ): Promise<ResponseDto<AccessTokensDto>> {
    const response = new ResponseDto<AccessTokensDto>(
      HttpStatus.OK,
      ResponseMessage.CREATED,
    );

    const refresh_token: string = payload.refresh_token;

    const decodedJwtPayload: JwtPayload = await this.decodeJwtPayload(
      refresh_token,
    );

    const userId: ObjectId = decodedJwtPayload._id;
    const timestamp: number = decodedJwtPayload.timestamp;
    const now: number = new Date().getTime();

    const userToRenewCredentials: IUser = await this.usersService.findOne({
      _id: userId,
    });

    if (!userToRenewCredentials) throw new NotFoundException(i18n, 'user');

    if (userToRenewCredentials.lastRefreshToken !== timestamp)
      throw new CredentialsExpiredException(i18n);

    if (this.refreshTokenExpired(timestamp, now))
      throw new CredentialsExpiredException(i18n);

    await this.usersService.updateOne(
      { _id: userToRenewCredentials._id },
      { lastRefreshToken: now },
    );

    const newCredentials: JwtPayload = {
      _id: userToRenewCredentials._id,
    };

    const accessToken: string = this.generateAccessToken(newCredentials);
    const refreshToken: string = this.generateRefreshToken(newCredentials, now);

    const responsePayload: AccessTokensDto = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    response.payload = responsePayload;

    return response;
  }

  public async activateAccount(
    payload: ActivateAccountDto,
    i18n: I18nContext,
  ): Promise<ResponseDto<object>> {
    const response = new ResponseDto<object>(HttpStatus.OK, ResponseMessage.OK);

    const userToActivate: IUser = await this.usersService.findOne({
      email: payload.email,
    });

    if (!userToActivate) throw new NotFoundException(i18n, 'user');
    if (userToActivate.activated) throw new AlreadyActivatedException(i18n);
    if (userToActivate.activationCode !== Number(payload.activationCode))
      throw new WrongCodeException(i18n, 'activationCode');

    const jwtPayload: JwtPayload = {
      _id: userToActivate._id,
    };

    const now: number = new Date().getTime();

    const accessToken: string = this.generateAccessToken(jwtPayload);
    const refreshToken: string = this.generateRefreshToken(jwtPayload, now);

    const newCode = await this.generateRandomNumber();

    await this.usersService.updateOne(
      { _id: userToActivate._id },
      {
        activationCode: newCode,
        activated: true,
        lastRefreshToken: now,
      },
    );

    const responsePayload: AccessTokensDto = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    response.payload = responsePayload;

    return response;
  }

  public async setForgottenPassword(
    payload: SetForgottenPasswordDto,
    i18n: I18nContext,
  ): Promise<ResponseDto<object>> {
    const response = new ResponseDto<object>(HttpStatus.OK, ResponseMessage.OK);

    const userToRenewPassword: IUser = await this.usersService.findOne({
      email: payload.email,
    });

    if (!userToRenewPassword) throw new NotFoundException(i18n, 'user');
    if (
      userToRenewPassword.passwordRecoveryCode !==
      Number(payload.passwordRecoveryCode)
    )
      throw new WrongCodeException(i18n, 'passwordRecoveryCode');

    const passwordsMatch: boolean = await this.matchPasswords(
      payload.password,
      userToRenewPassword.password,
    );

    if (passwordsMatch) throw new SamePasswordException(i18n);

    const hashedPassword: string = await this.hashPassword(payload.password);

    const newCode = this.generateRandomNumber();

    await this.usersService.updateOne(
      { _id: userToRenewPassword._id },
      {
        password: hashedPassword,
        passwordRecoveryCode: newCode,
      },
    );

    return response;
  }

  public async sendCode(
    payload: SendCodeDto,
    i18n: I18nContext,
    requestedCode: 'activation-code' | 'password-recovery',
  ): Promise<ResponseDto<object>> {
    const response = new ResponseDto<object>(HttpStatus.OK, ResponseMessage.OK);

    const userRequiringCode: IUser = await this.usersService.findOne({
      email: payload.email,
    });

    if (!userRequiringCode) throw new NotFoundException(i18n, 'user');

    if (requestedCode === 'activation-code' && userRequiringCode.activated)
      throw new AlreadyActivatedException(i18n);

    if (requestedCode === 'password-recovery' && !userRequiringCode.activated)
      throw new NotActivatedException(i18n);

    const newCode: number = this.generateRandomNumber();

    const update: FilterQuery<User> = {};

    requestedCode === 'activation-code'
      ? (update.activationCode = newCode)
      : (update.passwordRecoveryCode = newCode);

    const updatedUser: IUser = await this.usersService.updateOne(
      { _id: userRequiringCode._id },
      update,
    );

    await this.emailService.sendAuthEmail(updatedUser, requestedCode);

    return response;
  }

  public async changePassword(
    payload: ChangePasswordDto,
    jwtPayload: JwtPayload,
    i18n: I18nContext,
  ): Promise<ResponseDto<object>> {
    const response = new ResponseDto<object>(HttpStatus.OK, ResponseMessage.OK);

    const userToChangePassword: IUser = await this.usersService.findOne({
      _id: jwtPayload._id,
    });

    const passwordsMatch: boolean = await this.matchPasswords(
      payload.password,
      userToChangePassword.password,
    );

    if (passwordsMatch) throw new SamePasswordException(i18n);

    const hashedPassword: string = await this.hashPassword(payload.password);
    const newCode: number = this.generateRandomNumber();

    await this.usersService.updateOne(
      { _id: userToChangePassword._id },
      {
        password: hashedPassword,
        passwordRecoveryCode: newCode,
      },
    );

    return response;
  }

  private generateRandomNumber(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private async matchPasswords(
    payloadPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(payloadPassword, userPassword);
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_TIME,
    });
  }

  private generateRefreshToken(payload: JwtPayload, timestamp: number): string {
    return this.jwtService.sign(
      { ...payload, timestamp },
      {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_TIME,
      },
    );
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async decodeJwtPayload(refreshToken: string): Promise<JwtPayload> {
    const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
    return decoded;
  }

  private refreshTokenExpired(timestamp: number, now: number): boolean {
    const diffTime: number = Math.abs(timestamp - now);
    const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const expireAfterDays: number = parseInt(
      process.env.JWT_REFRESH_TOKEN_TIME.match(/\d+/)[0],
    );

    return diffDays > expireAfterDays;
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async matchPasswords(
    payloadPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(payloadPassword, userPassword);
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_TIME,
    });
  }

  generateRefreshToken(payload: JwtPayload, timestamp: number): string {
    return this.jwtService.sign(
      { ...payload, timestamp },
      {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_TIME,
      },
    );
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async decodeJwtPayload(refreshToken: string): Promise<JwtPayload> {
    const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
    return decoded;
  }
}

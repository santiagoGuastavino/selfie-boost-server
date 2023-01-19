import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/model/schemas/user.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      signOptions: { expiresIn: '10s' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // remove this?
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

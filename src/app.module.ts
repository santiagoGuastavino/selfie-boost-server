import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import { BlogsModule } from './resources/blogs/blogs.module';
import { I18nModule } from './i18n/i18n.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.NODE_ENV === 'test' ? process.env.DB_TEST : process.env.DB,
    ),
    I18nModule,
    AuthModule,
    UsersModule,
    BlogsModule,
  ],
})
export class AppModule {}

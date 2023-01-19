import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import { BlogsModule } from './resources/blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB),
    AuthModule,
    UsersModule,
    BlogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

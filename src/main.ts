import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  i18nValidationErrorFactory,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';
import { AppModule } from './app.module';
import { AWSConfig } from './config/aws.config';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: i18nValidationErrorFactory,
    }),
  );
  app.useGlobalFilters(new I18nValidationExceptionFilter());
  app.enableCors();
  app.use(
    json({
      limit: '50mb',
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      limit: '50mb',
    }),
  );
  AWSConfig();
  await app.listen(process.env.PORT);
}
bootstrap();

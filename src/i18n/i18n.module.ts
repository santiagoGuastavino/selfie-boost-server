import { Module } from '@nestjs/common';
import * as path from 'path';
import {
  I18nModule as i18n,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';

@Module({
  imports: [
    i18n.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname + '/'),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['Accept-Language']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  exports: [i18n],
})
export class I18nModule {}

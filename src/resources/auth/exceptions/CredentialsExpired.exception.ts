import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

export class CredentialsExpiredException extends HttpException {
  constructor(i18n: I18nContext) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.BAD_REQUEST,
        errors: [
          {
            property: 'refresh_token',
            children: [],
            constraints: {
              CREDENTIALS_EXPIRED: i18n.t('exceptions.CREDENTIALS_EXPIRED'),
            },
          },
        ],
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

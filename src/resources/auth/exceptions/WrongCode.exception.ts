import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

type Property = 'activationCode' | 'passwordRecoveryCode';

export class WrongCodeException extends HttpException {
  constructor(i18n: I18nContext, property: Property) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: HttpStatus.BAD_REQUEST,
        errors: [
          {
            property,
            children: [],
            constraints: {
              WRONG_CODE: i18n.t('exceptions.WRONG_CODE', {
                args: {
                  property,
                },
              }),
            },
          },
        ],
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

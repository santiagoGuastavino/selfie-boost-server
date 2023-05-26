import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ResponseMessage } from '../dtos/response.dto';

type Properties = 'email';

export class AlreadyExistsException extends HttpException {
  constructor(i18n: I18nContext, property: Properties) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: ResponseMessage.CONFLICT,
        errors: [
          {
            property,
            children: [],
            constraints: {
              ALREADY_EXISTS: i18n.t('exceptions.ALREADY_EXISTS', {
                args: {
                  property,
                },
              }),
            },
          },
        ],
      },
      HttpStatus.CONFLICT,
    );
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ResponseMessage } from 'src/common/dtos/response.dto';

export class SamePasswordException extends HttpException {
  constructor(i18n: I18nContext) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        errors: [
          {
            property: 'password',
            children: [],
            constraints: {
              SAME_PASSWORD: i18n.t('exceptions.SAME_PASSWORD'),
            },
          },
        ],
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

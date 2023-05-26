import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

type Entities = 'user';

export class NotFoundException extends HttpException {
  constructor(i18n: I18nContext, entity: Entities) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        errors: [
          {
            entity,
            children: [],
            constraints: {
              NOT_FOUND: i18n.t('exceptions.NOT_FOUND', {
                args: {
                  entity,
                },
              }),
            },
          },
        ],
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

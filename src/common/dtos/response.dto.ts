import { HttpStatus } from '@nestjs/common';

export class ResponseDto {
  statusCode: HttpStatus;
  message:
    | 'Ok'
    | 'Bad Request'
    | 'Created'
    | 'Internal Server Error'
    | 'Unauthorized'
    | 'Conflict'
    | 'Not Found'
    | 'Forbidden';
  payload: any;
  errors: ExceptionError[];

  constructor(
    statusCode = HttpStatus.OK,
    message:
      | 'Ok'
      | 'Bad Request'
      | 'Created'
      | 'Internal Server Error'
      | 'Unauthorized'
      | 'Conflict'
      | 'Not Found'
      | 'Forbidden',
    payload = {},
    errors = [],
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.payload = payload;
    this.errors = errors;
  }
}

class ExceptionError {
  property: string;
  children: string[];
  constraints: any;
}

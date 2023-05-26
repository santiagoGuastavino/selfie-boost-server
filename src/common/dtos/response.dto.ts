import { HttpStatus } from '@nestjs/common';

export enum ResponseMessage {
  OK = 'Ok',
  CREATED = 'Created',
  BAD_REQUEST = 'Bad Request',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  CONFLICT = 'Conflict',
}

export class ResponseDto<T> {
  statusCode: HttpStatus;
  message: ResponseMessage;
  payload: T;
  errors: any[];

  constructor(
    statusCode = HttpStatus.OK,
    message: ResponseMessage = ResponseMessage.OK,
    payload: T = {} as T,
    errors = [],
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.payload = payload;
    this.errors = errors;
  }
}

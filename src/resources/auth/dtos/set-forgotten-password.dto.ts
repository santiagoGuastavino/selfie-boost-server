import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SetForgottenPasswordDto {
  @IsEmail({}, { message: i18nValidationMessage('dto.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  email: string;

  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @MinLength(6, { message: i18nValidationMessage('dto.MIN_LENGTH') })
  password: string;

  @IsNumberString({}, { message: i18nValidationMessage('dto.IS_NUMBER') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @Length(6, 6, { message: i18nValidationMessage('dto.LENGTH') })
  passwordRecoveryCode: number;
}

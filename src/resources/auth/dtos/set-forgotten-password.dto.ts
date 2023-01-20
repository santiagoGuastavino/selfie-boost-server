import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
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

  @IsNumber({}, { message: i18nValidationMessage('dto.IS_NUMBER') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @Min(100000, { message: i18nValidationMessage('dto.MIN') })
  @Max(999999, { message: i18nValidationMessage('dto.MAX') })
  passwordRecoveryCode: number;
}

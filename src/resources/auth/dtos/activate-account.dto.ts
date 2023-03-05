import { IsEmail, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ActivateAccountDto {
  @IsEmail({}, { message: i18nValidationMessage('dto.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  email: string;

  @IsNumberString({}, { message: i18nValidationMessage('dto.IS_NUMBER') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @Length(6, 6, { message: i18nValidationMessage('dto.LENGTH') })
  activationCode: number;
}

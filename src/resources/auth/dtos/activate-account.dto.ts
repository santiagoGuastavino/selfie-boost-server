import { IsEmail, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ActivateAccountDto {
  @IsEmail({}, { message: i18nValidationMessage('dto.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  email: string;

  @IsNumber({}, { message: i18nValidationMessage('dto.IS_NUMBER') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @Min(100000, { message: i18nValidationMessage('dto.MIN') })
  @Max(999999, { message: i18nValidationMessage('dto.MAX') })
  activationCode: number;
}

import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SendCodeDto {
  @IsEmail({}, { message: i18nValidationMessage('dto.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  email: string;
}

import { IsJWT, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RefreshAccessTokenDto {
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @IsJWT({ message: i18nValidationMessage('dto.IS_JWT') })
  refresh_token: string;
}

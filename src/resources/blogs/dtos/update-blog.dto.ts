import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateBlogDto {
  @IsMongoId({ message: i18nValidationMessage('dto.IS_MONGO_ID') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  _id: string;

  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @IsOptional()
  public title: string;

  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @IsOptional()
  @IsOptional()
  public description: string;

  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @IsOptional()
  public image: string;

  buffer: Buffer;
}

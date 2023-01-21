import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateBlogDto {
  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  public title: string;

  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  @IsOptional()
  public description: string;

  @IsString({ message: i18nValidationMessage('dto.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  public image: string;

  buffer: Buffer;
}

export class SaveBlog {
  title: string;
  description?: string;
  image: string;
  user: ObjectId;
}

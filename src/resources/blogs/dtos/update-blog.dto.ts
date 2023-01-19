import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @IsMongoId()
  public _id: string;

  @IsString()
  @IsOptional()
  public title: string;

  @IsString()
  @IsOptional()
  public description: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;
}

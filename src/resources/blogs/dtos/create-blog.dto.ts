import { IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  public title: string;

  @IsString()
  @IsOptional()
  public description: string;

  @IsString()
  public imageUrl: string;
}

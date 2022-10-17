import { IsMongoId } from 'class-validator';

export class DeleteBlogDto {
  @IsMongoId()
  public _id: string;
}

import { IsMongoId } from 'class-validator';

export class ReadOneBlogDto {
  @IsMongoId()
  public _id: string;
}

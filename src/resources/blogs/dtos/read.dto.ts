import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BlogsUserPopulated {
  _id: ObjectId;
  title: string;
  description: null | string;
  image: string;
  user: UserPopulated;
}

class UserPopulated {
  _id: ObjectId;
  firstName: string;
  lastName: string;
}

export class ReadOneByIdDto {
  @IsMongoId({ message: i18nValidationMessage('dto.IS_MONGO_ID') })
  @IsNotEmpty({ message: i18nValidationMessage('dto.IS_NOT_EMPTY') })
  _id: string;
}

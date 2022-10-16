import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(6)
  public password: string;
}

import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

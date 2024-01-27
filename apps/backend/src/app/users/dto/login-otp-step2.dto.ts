import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginOtpDtoStep2 {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}

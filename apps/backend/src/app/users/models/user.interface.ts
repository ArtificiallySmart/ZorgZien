export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  otp?: string;
  otpExpires?: Date;
  otpAttempts?: number;
}

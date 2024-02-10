import { Organisation } from '../../organisation/entities/organisation.entity';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  otp?: string;
  otpExpires?: Date;
  otpAttempts?: number;
  organisation?: Organisation;
}

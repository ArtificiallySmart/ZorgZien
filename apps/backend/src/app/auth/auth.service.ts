import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { from } from 'rxjs';
import { User } from '../users/models/user.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // async validateUser(
  //   username: string,
  //   pass: string
  // ): Promise<Omit<User, 'password'>> {
  //   const user = await this.usersService.findOne(username);
  //   if (user && user.password === pass) {
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  // async login(user: Omit<User, 'password'>) {
  //   const payload = { email: user.email, sub: user.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  generateJWT(user: Omit<User, 'password'>) {
    return from(this.jwtService.signAsync({ user }));
  }

  hashPassword(password: string) {
    return from(bcrypt.hash(password, 12));
  }

  comparePasswords(newPassword: string, passwordHash: string) {
    return from(bcrypt.compare(newPassword, passwordHash));
  }
}

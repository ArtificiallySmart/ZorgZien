import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
import { from } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.interface';

export type DecodedToken = {
  user: Omit<User, 'password'>;
  tokenId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  createAccessToken(user: Omit<User, 'password'>) {
    return from(this.jwtService.signAsync({ user }));
  }

  createRefreshToken(user: Omit<User, 'password'>) {
    const tokenId = uuidv4();
    return from(
      this.jwtService.signAsync(
        { user, tokenId: tokenId },
        {
          expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        }
      )
    );
  }

  decodeRefreshToken(token: string) {
    try {
      return this.jwtService.verify<DecodedToken>(token);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  replaceRefreshToken(user: Omit<User, 'password'>) {
    return this.createRefreshToken(user);
  }
}

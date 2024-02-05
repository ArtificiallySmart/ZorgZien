import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(payload: {
    user: Omit<User, 'password'>;
    iat: number;
    exp: number;
  }) {
    return { user: payload.user };
  }
}

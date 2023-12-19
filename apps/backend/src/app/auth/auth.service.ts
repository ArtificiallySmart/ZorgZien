import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { from, map, switchMap } from 'rxjs';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/models/user.interface';
import { TokenBlacklistEntity } from './models/token-blacklist.entity';
import { CronJob } from 'cron';

export type DecodedToken = {
  user: Omit<User, 'password'>;
  tokenId: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private dataSource: DataSource) {}

  tokenRepository = this.dataSource.getRepository(TokenBlacklistEntity);

  removeExpiredRefreshTokens = CronJob.from({
    cronTime: '0 0 * * *',
    onTick: () => {
      this.tokenRepository.delete({
        expires: new Date(Date.now()),
      });
    },
    start: true,
  });

  createAccessToken(user: Omit<User, 'password'>) {
    return from(this.jwtService.signAsync({ user }));
  }

  hashPassword(password: string) {
    return from(bcrypt.hash(password, 12));
  }

  comparePasswords(newPassword: string, passwordHash: string) {
    return from(bcrypt.compare(newPassword, passwordHash));
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
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  replaceRefreshToken(user: Omit<User, 'password'>, oldTokenId: string) {
    return from(
      this.tokenRepository.exist({ where: { token: oldTokenId } })
    ).pipe(
      switchMap((exists: boolean) => {
        if (exists) {
          throw new UnauthorizedException('Invalid refresh token');
        } else {
          const newToken = this.tokenRepository.create({ token: oldTokenId });
          this.tokenRepository.save(newToken);
          return this.createRefreshToken(user);
        }
      }),
      map((token: string) => {
        return token;
      })
    );
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
import { Observable, forkJoin, from, map, switchMap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.interface';
import { DataSource } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

export type DecodedToken = {
  user: Omit<User, 'password'>;
  tokenId: string;
  iat: number;
  exp: number;
};

type FailedLoginResponse = {
  error: string;
};

type SuccessfulLoginResponse = {
  access_token: string;
  refresh_token: string;
};

type LoginResponse = FailedLoginResponse | SuccessfulLoginResponse;

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private dataSource: DataSource,
    private usersService: UsersService,
    private emailService: EmailService
  ) {}

  userRepository = this.dataSource.getRepository(UserEntity);

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

  requestOtp(email: string) {
    return this.usersService.findOne(email).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new UnauthorizedException('Ongeldig emailadres');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 15);
        return from(
          this.userRepository.update(user.id, {
            otp: otp,
            otpExpires: otpExpires,
            otpAttempts: 0,
          })
        ).pipe(
          switchMap(() => {
            return this.emailService.sendOtpEmail(email, user, otp);
          }),
          map(() => {
            return {
              message: 'OTP sent',
            };
          })
        );
      })
    );
  }

  login(user: Omit<User, 'password'>): Observable<LoginResponse> {
    const accessToken$ = this.createAccessToken(user).pipe(
      map((jwt: string) => jwt)
    );

    const refreshToken$ = this.createRefreshToken(user);

    return forkJoin([accessToken$, refreshToken$]).pipe(
      map((jwtArray: string[]) => {
        return {
          access_token: jwtArray[0],
          refresh_token: jwtArray[1],
          user: user,
        };
      })
    );
  }

  validateUser(
    email: string,
    otp: string
  ): Observable<Omit<User, 'password'> | null> {
    return this.usersService.findOne(email).pipe(
      switchMap((user: User) => {
        if (!user) {
          return null;
        }
        if (user.otpAttempts >= 5) {
          this.clearOtp(user);
          throw new UnauthorizedException(
            'Te veel pogingen. Vraag een nieuwe inlogcode aan.'
          );
        }
        if (user.otp !== otp) {
          this.trackOtpAttempts(user);
          throw new UnauthorizedException('inlogcode onjuist');
        }
        if (user.otpExpires < new Date()) {
          throw new UnauthorizedException(
            'Inlogcode verlopen, vraag een nieuwe aan.'
          );
        }
        return this.clearOtp(user).pipe(
          map(() => {
            const result = {
              id: user.id,
              name: user.name,
              email: user.email,
              organisation: user.organisation,
            };
            return result;
          })
        );
      })
    );
  }

  trackOtpAttempts(user: User) {
    const otpAttempts = user.otpAttempts + 1;
    return from(
      this.userRepository.update(user.id, {
        otpAttempts: otpAttempts,
      })
    );
  }

  clearOtp(user: User) {
    return from(
      this.userRepository.update(user.id, {
        otp: null,
        otpExpires: null,
        otpAttempts: null,
      })
    );
  }
}

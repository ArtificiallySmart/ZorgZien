import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, forkJoin, from, map, switchMap } from 'rxjs';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';
import { UserEntity } from './entities/user.entity';
import { User } from './entities/user.interface';

type FailedLoginResponse = {
  error: string;
};

type SuccessfulLoginResponse = {
  access_token: string;
  refresh_token: string;
};

type LoginResponse = FailedLoginResponse | SuccessfulLoginResponse;

@Injectable()
export class UsersService {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    private dataSource: DataSource
  ) {}

  userRepository = this.dataSource.getRepository(UserEntity);

  findAll() {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        return users.map((user) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...result } = user;
          return result;
        });
      })
    );
  }

  findOneById(id: number) {
    return from(
      this.userRepository.findOne({
        where: {
          id: id,
        },
      })
    ).pipe(
      map((user: User) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      })
    );
  }

  findOne(email: string) {
    return from(
      this.userRepository.findOne({
        where: {
          email: email,
        },
        relations: ['organisation'],
      })
    );
  }

  deleteOne(id: number) {
    return this.userRepository.delete(id);
  }

  updateOne(id: number, user: UserEntity) {
    return this.userRepository.update(id, user);
  }

  login(user: Omit<User, 'password'>): Observable<LoginResponse> {
    const accessToken$ = this.authService
      .createAccessToken(user)
      .pipe(map((jwt: string) => jwt));

    const refreshToken$ = this.authService.createRefreshToken(user);

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

  requestOtp(email: string) {
    return this.findOne(email).pipe(
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

  validateUser(
    email: string,
    otp: string
  ): Observable<Omit<User, 'password'> | null> {
    return this.findOne(email).pipe(
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
}

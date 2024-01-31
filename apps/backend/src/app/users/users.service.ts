import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { postgresDataSource } from '../../../db/data-source';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { User } from './entities/user.interface';
import { EmailService } from '../email/email.service';

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
    private emailService: EmailService
  ) {}

  userRepository = postgresDataSource.getRepository(UserEntity);

  create(createUserDto: CreateUserDto): Observable<Omit<User, 'password'>> {
    return of(true).pipe(
      switchMap((exist: boolean) => {
        if (!exist) {
          throw new ForbiddenException('User not whitelisted');
        }
        return this.findOne(createUserDto.email).pipe(
          switchMap((user: User) => {
            if (user) {
              throw new ForbiddenException('User already exists');
            }
            return this.authService.hashPassword(createUserDto.password).pipe(
              switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = createUserDto.name;
                newUser.email = createUserDto.email;
                newUser.password = passwordHash;
                return from(this.userRepository.save(newUser)).pipe(
                  map((user: User) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { password, ...result } = user;
                    return result;
                  }),
                  catchError((err) => {
                    throw err;
                  })
                );
              })
            );
          })
        );
      })
    );
  }

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
      })
    );
  }

  deleteOne(id: number) {
    return this.userRepository.delete(id);
  }

  updateOne(id: number, user: UserEntity) {
    return this.userRepository.update(id, user);
  }

  login(user: Omit<User, 'id' | 'name'>): Observable<LoginResponse> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: Omit<User, 'password'>) => {
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
      }),
      catchError((err) => {
        throw err;
      })
    );
  }

  loginOtp(email: string) {
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
            return this.sendOtpEmail(email, otp);
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

  loginOtpVerify(email: string, otp: string): Observable<LoginResponse> {
    return this.findOne(email).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new UnauthorizedException('Ongeldig emailadres');
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
        return this.authService.createAccessToken(user).pipe(
          tap(() => {
            this.clearOtp(user);
          }),
          switchMap((jwt: string) => {
            return this.authService.createRefreshToken(user).pipe(
              map((refreshToken: string) => {
                return {
                  access_token: jwt,
                  refresh_token: refreshToken,
                  user: user,
                };
              })
            );
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

  sendOtpEmail(email: string, otp: string) {
    return this.emailService.sendOtpEmail(email, otp);
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
    password: string
  ): Observable<Omit<User, 'password'> | null> {
    return this.findOne(email).pipe(
      switchMap((user: User) => {
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { password, ...result } = user;
              return result;
            } else {
              throw new UnauthorizedException('Invalid credentials');
              return null;
            }
          })
        );
      })
    );
  }
}

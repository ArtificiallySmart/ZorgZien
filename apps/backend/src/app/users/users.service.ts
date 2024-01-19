import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, catchError, forkJoin, from, map, switchMap } from 'rxjs';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserWhitelistEntity } from './models/user-whitelist.entity';
import { UserEntity } from './models/user.entity';
import { User } from './models/user.interface';

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
    private dataSource: DataSource,
    private authService: AuthService
  ) {
    this.seedWhitelist();
  }

  userRepository = this.dataSource.getRepository(UserEntity);
  userWhitelistRepository = this.dataSource.getRepository(UserWhitelistEntity);

  async seedWhitelist() {
    const count = await this.userWhitelistRepository.count();
    if (count === 0) {
      const firstUser = process.env.ADMIN_EMAIL;
      this.userWhitelistRepository.create({ email: firstUser });
      this.userWhitelistRepository.save({ email: firstUser });
    }
  }

  // async findOne(email: string): Promise<User | undefined> {
  //   return this.users.find((user) => user.email === email);
  // }

  create(createUserDto: CreateUserDto): Observable<Omit<User, 'password'>> {
    return from(
      this.userWhitelistRepository.exist({
        where: {
          email: createUserDto.email,
        },
      })
    ).pipe(
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

import { Injectable } from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import {
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';
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
  ) {}

  userRepository = this.dataSource.getRepository(UserEntity);

  create(createUserDto: CreateUserDto): Observable<Omit<User, 'password'>> {
    return this.authService.hashPassword(createUserDto.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
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

  login(user: Omit<User, 'id'>): Observable<LoginResponse> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: Omit<User, 'password'>) => {
        if (!user) {
          return of({ error: 'Wrong Credentials' });
        }
        const accessToken$ = this.authService
          .createAccessToken(user)
          .pipe(map((jwt: string) => jwt));

        const refreshToken$ = this.authService.createRefreshToken(user);

        return forkJoin([accessToken$, refreshToken$]).pipe(
          map((jwtArray: string[]) => {
            return {
              access_token: jwtArray[0],
              refresh_token: jwtArray[1],
            };
          })
        );
      })
    );
  }

  validateUser(
    email: string,
    password: string
  ): Observable<Omit<User, 'password'> | null> {
    return this.findOne(email).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { password, ...result } = user;
              return result;
            } else {
              return null;
            }
          })
        )
      )
    );
  }
}

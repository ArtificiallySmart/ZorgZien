import { Injectable } from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { Observable, catchError, from, map, switchMap } from 'rxjs';
import { User } from './models/user.interface';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    private authService: AuthService
  ) {}

  userRepository = this.dataSource.getRepository(UserEntity);
  // private readonly users = [
  //   {
  //     id: 1,
  //     email: 'test@example.com',
  //     password: 'changeme',
  //   },
  //   {
  //     id: 2,
  //     email: 'test2@example.com',
  //     password: 'guess',
  //   },
  // ];

  // async findOne(email: string): Promise<User | undefined> {
  //   return this.users.find((user) => user.email === email);
  // }

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
    // return this.userRepository.save(createUserDto);
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
    console.log(email);
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

  login(user: Omit<User, 'id'>): Observable<string> {
    // return this.authService.generateJWT(user).pipe(
    //   switchMap((jwt: string) => {
    //     return from(
    //       this.userRepository.findOne({
    //         where: {
    //           email: user.email,
    //         },
    //       })
    //     ).pipe(
    //       map((user: User) => {
    //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //         const { password, ...result } = user;
    //         return { user: result, token: jwt };
    //       })
    //     );
    //   })
    // );
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: Omit<User, 'password'>) => {
        if (!user) {
          return 'Wrong Credentials';
        }
        return this.authService
          .generateJWT(user)
          .pipe(map((jwt: string) => jwt));
      })
    );
  }

  validateUser(
    email: string,
    password: string
  ): Observable<Omit<User, 'password'>> {
    return this.findOne(email).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          })
        )
      )
    );
  }
}

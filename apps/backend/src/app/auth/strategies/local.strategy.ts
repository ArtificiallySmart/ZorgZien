import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../users/entities/user.interface';
import { UsersService } from '../../users/users.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(UsersService) private usersService: UsersService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    email: string,
    password: string
  ): Promise<Omit<User, 'password'>> {
    const user = firstValueFrom(
      this.usersService.validateUser(email, password)
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

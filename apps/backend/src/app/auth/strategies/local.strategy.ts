import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../users/entities/user.interface';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AuthService) private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'otp',
    });
  }

  async validate(email: string, otp: string): Promise<Omit<User, 'password'>> {
    const user = firstValueFrom(this.authService.validateUser(email, otp));
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import { map, forkJoin, catchError } from 'rxjs';
import { LoginOtpDto } from './dto/login-otp.dto';
import { UserEntity } from '../users/entities/user.entity';
import { User } from '../users/entities/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService
  ) {}

  get cookieOptions() {
    if (process.env.NODE_ENV !== 'production') {
      return {
        httpOnly: true,
      } as CookieOptions;
    }
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.RAILWAY_STATIC_URL,
    } as CookieOptions;
  }

  @Public()
  @Post('login-otp')
  loginOtp(@Body() dto: LoginOtpDto) {
    const { email } = dto;
    return this.authService.requestOtp(email);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login-otp-verify')
  loginOtpVerify(@Req() req: Request, @Res() res: Response) {
    const user = req.user as Omit<User, 'password'>;
    return this.authService.login(user).pipe(
      map(
        (tokens: {
          access_token: string;
          refresh_token: string;
          user: UserEntity;
        }) => {
          res.cookie('refresh_token', tokens.refresh_token, this.cookieOptions);
          return res.send({
            access_token: tokens.access_token,
            user: tokens.user,
          });
        }
      )
    );
  }

  @Public()
  @Post('refresh')
  refresh(@Res() res: Response, @Req() req: Request) {
    const oldRefreshToken = req.cookies['refresh_token'];
    res.clearCookie('refresh_token');
    if (!oldRefreshToken) {
      throw new HttpException('No refresh token provided', 400);
    }
    const decodedToken = this.authService.decodeRefreshToken(oldRefreshToken);

    const user = decodedToken.user;
    const newAccessToken = this.authService.createAccessToken(user);
    const newRefreshToken = this.authService.replaceRefreshToken(user);

    return forkJoin([newAccessToken, newRefreshToken]).pipe(
      map((tokens: string[]) => {
        res.cookie('refresh_token', tokens[1], this.cookieOptions);
        return res.send({ access_token: tokens[0], user: user });
      }),
      catchError((err) => {
        throw err;
      })
    );
  }

  @Public()
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refresh_token', this.cookieOptions);
    return res.send({ message: 'Logged out' });
  }
}

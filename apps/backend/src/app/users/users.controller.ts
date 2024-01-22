import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, forkJoin, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorators/public';
import { UsersService } from './users.service';
import { UserEntity } from './models/user.entity';
import { LoginDto } from './dto/login.dto';
import { CookieOptions } from 'express-serve-static-core';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
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
  @Post('register')
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user).pipe(
      map((user: UserEntity) => user),
      catchError((err) => {
        throw err;
      })
    );
  }

  @Public()
  @Post('login')
  login(@Body() user: LoginDto, @Res() res: Response) {
    return this.usersService.login(user).pipe(
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
      ),
      catchError(() => {
        throw new UnauthorizedException('Invalid credentials');
      })
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

import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorators/public';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UserEntity } from './models/user.entity';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService
  ) {}

  @Public()
  @Post('register')
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user).pipe(
      map((user: UserEntity) => user),
      catchError((err) => of({ error: err.message }))
    );
  }

  @Public()
  @Post('login')
  login(@Body() user: LoginDto, @Res() res: Response) {
    return this.usersService.login(user).pipe(
      map((tokens: { access_token: string; refresh_token: string }) => {
        res.cookie('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          // secure: true, // Uncomment this line if you're using HTTPS
          // domain: 'your-domain.com', // Set your domain if needed
          // maxAge: 7 * 24 * 60 * 60 * 1000, // Set the cookie expiration time if needed
        });
        return res.send({ access_token: tokens.access_token });
      }),
      catchError((err) => {
        console.log(err.message);
        throw new HttpException(err.message, 400);
      })
    );
  }

  @Public()
  @Post('refresh')
  refresh(@Res() res: Response, @Req() req: Request) {
    const oldRefreshToken = req.cookies['refresh_token'];
    res.clearCookie('refresh_token');
    if (!oldRefreshToken) {
      // throw new Error('No refresh token provided');
      throw new HttpException('No refresh token provided', 400);
    }
    const decodedToken = this.authService.decodeRefreshToken(oldRefreshToken);
    // Validate old refresh token, if invalid, throw an error.
    const user = decodedToken.user;
    const newAccessToken = this.authService.createAccessToken(user);
    const newRefreshToken = this.authService.replaceRefreshToken(
      user,
      decodedToken.tokenId
    );

    return forkJoin([newAccessToken, newRefreshToken]).pipe(
      map((tokens: string[]) => {
        res.cookie('refresh_token', tokens[1], {
          httpOnly: true,
          // secure: true, // Uncomment this line if you're using HTTPS
          // domain: 'your-domain.com', // Set your domain if needed
          // maxAge: 7 * 24 * 60 * 60 * 1000, // Set the cookie expiration time if needed
        });
        return res.send({ access_token: tokens[0] });
      }),
      catchError((err) => {
        throw err;
      })
    );
  }

  @Public()
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refresh_token');
    return res.send({ message: 'Logged out' });
  }
}

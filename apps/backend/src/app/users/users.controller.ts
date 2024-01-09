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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService
  ) {}

  // @Public()
  // @Post()
  // create(@Body() user: CreateUserDto) {
  //   return this.usersService.create(user).pipe(
  //     map((user: UserEntity) => user),
  //     catchError((err) => of({ error: err.message }))
  //   );
  // }

  @Public()
  @Post('login')
  login(@Body() user: CreateUserDto, @Res() res: Response) {
    return this.usersService.login(user).pipe(
      map((tokens: { access_token: string; refresh_token: string }) => {
        res.cookie('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          domain: process.env.RAILWAY_STATIC_URL,
        });
        return res.send({ access_token: tokens.access_token });
      }),
      catchError((err) => of({ error: err.message }))
    );
  }

  @Public()
  @Post('refresh')
  refresh(@Res() res: Response, @Req() req: Request) {
    const oldRefreshToken = req.cookies['refresh_token'];
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
          secure: true,
          sameSite: 'none',
          domain: process.env.RAILWAY_STATIC_URL,
        });
        return res.send({ access_token: tokens[0] });
      }),
      catchError((err) => {
        throw err;
      })
    );

    // res.cookie('refreshToken', newRefreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    // });

    // return res.send({ accessToken: newAccessToken });
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findOneById(id);
  // }

  // @Put(':id')
  // update(@Param('id') id: string, @Body() user: UserEntity) {
  //   return this.usersService.updateOne(+id, user);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.deleteOne(+id);
  // }
}

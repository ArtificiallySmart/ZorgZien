import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './models/user.entity';
import { map, catchError, of } from 'rxjs';
import { Public } from '../auth/decorators/public';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user).pipe(
      map((user: UserEntity) => user),
      catchError((err) => of({ error: err.message }))
    );
  }

  @Public()
  @Post('login')
  login(@Body() user: CreateUserDto) {
    return this.usersService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      })
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: UserEntity) {
    return this.usersService.updateOne(+id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteOne(+id);
  }
}

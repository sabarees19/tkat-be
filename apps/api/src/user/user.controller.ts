import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch
} from '@nestjs/common';
import { UpdateUserDto } from '@tkat-backend/shared';
import { UserService } from 'libs/user/src/user.service';
import { Permissions } from '../auth/permission.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Permissions('USER:LIST')
  @Get()
  findAllUser() {
    return this.userService.findAllUser();
  }

  @Permissions('USER:LIST')
  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.userService.findUserById(id);
  }

  @Permissions('USER:UPDATE')
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() request: UpdateUserDto) {
    return this.userService.updateUser(id, request);
  }

  @Permissions('USER:DELETE')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}

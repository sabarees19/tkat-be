import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CreateUserDto } from '@tkat-backend/shared';
import { Request } from 'express';
import { Public } from './auth.public';
import { AuthService } from './auth.service';
import { Permissions } from './permission.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Permissions('USER:ADD')
  @Post('user/invite')
  createUser(@Body() request: CreateUserDto) {
    return this.authService.createUser(request);
  }

  @Public()
  @Get('auth/signin')
  signIn(@Req() request: Request) {
    return this.authService.signIn(request);
  }
}

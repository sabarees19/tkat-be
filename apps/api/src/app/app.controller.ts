import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from '../auth/auth.public';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Public()
  @Post('create-admin-user')
  async createAdminUser(@Body() body: { email: string, userName: string, employeeId: string, roleId: string }) {
    return this.appService.createAdminUser(body);
  }

  @Public()
  @Post('seed-data')
  async seedData() {
    return this.appService.seedData();
  }
}

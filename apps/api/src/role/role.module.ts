import { Module } from '@nestjs/common';
import { RoleLibModule } from '@tkat-backend/role';
import { RoleController } from './role.controller';

@Module({
    imports: [RoleLibModule],
    controllers: [RoleController],
})
export class RoleModule {}

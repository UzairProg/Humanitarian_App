import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from '../../database/schemas/role.schema';
import { Permission, PermissionSchema } from '../../database/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [RolesController],
})
export class RolesModule {}

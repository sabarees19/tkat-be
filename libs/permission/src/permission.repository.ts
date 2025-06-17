import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import { DatabaseError, databaseErrorEnum, mongoDbConstant, Permission } from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class PermissionRepository extends BaseMongodbRepository<Permission> {
  constructor(
    @Inject(mongoDbConstant.PERMISSION_MODEL) model: Model<Permission>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async existsByName(name: string, options?: { session?: ClientSession }) {
    return this.model.exists({
        permissionName: name,
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .session(options?.session ?? null)
      .exec().catch((error) => {
        throw new DatabaseError(
          databaseErrorEnum.enum.DATABASE_ERROR,
          { cause: error }
        );
      });
  }

  async findPermissionIdByPermissionName(permissionName: string[]) {
    return this.model.aggregate([
      { $match: { permissionName: { $all: permissionName } } },
      { $project: { id: { $toString: '$_id' } } }
    ]).exec().catch((error) => {
      throw new DatabaseError(
        databaseErrorEnum.enum.DATABASE_ERROR,
        { cause: error }
      );
    });
  }
}

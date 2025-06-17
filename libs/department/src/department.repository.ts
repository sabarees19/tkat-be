import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import { DatabaseError, databaseErrorEnum, mongoDbConstant } from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { Department } from 'libs/shared/src/mongoose-schema/department.schema';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class DepartmentRepository extends BaseMongodbRepository<Department> {
  constructor(
    @Inject(mongoDbConstant.DEPARTMENT_MODEL)
    model: Model<Department>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async existsByDepartmentCheckName(
    departmentCheckName: string,
    options?: { session?: ClientSession }
  ) {
    return this.model
      .exists({
        departmentCheckName,
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .session(options?.session ?? null)
      .exec().catch((error) => {
        throw new DatabaseError(
          databaseErrorEnum.enum.DATABASE_ERROR,
          { cause: error });
      });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import {
  DatabaseError,
  databaseErrorEnum,
  mongoDbConstant,
  User,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClientSession, Model, ObjectId } from 'mongoose';

@Injectable()
export class UserRepository extends BaseMongodbRepository<User> {
  constructor(
    @Inject(mongoDbConstant.USER_MODEL)
    model: Model<User>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async findByEmail(email: string, options?: { session?: ClientSession }) {
    return await this.model
      .findOne({
        email,
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async existsByEmail(email: string, options?: { session?: ClientSession }) {
    return await this.model
      .exists({
        email,
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async existsByIds(ids: string[], options?: { session?: ClientSession }) {
    const objectIds = ids.map(id => new this.model.base.Types.ObjectId(id));
    const existingUsers = await this.model
      .find({
        _id: { $in: objectIds },
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .select('_id')
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });

    return existingUsers.map(user => (user._id as ObjectId).toString());
  }
}

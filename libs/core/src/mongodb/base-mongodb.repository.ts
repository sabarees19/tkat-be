import {
  BaseDocument,
  DatabaseError,
  databaseErrorEnum,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClientSession, Model, UpdateQuery } from 'mongoose';

export class BaseMongodbRepository<T extends BaseDocument> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly utilsService: UtilsService
  ) {}

  async create(
    data: Partial<T>,
    options?: { session?: ClientSession }
  ): Promise<T> {
    data = this.utilsService.setCreatedAtAndCreatedBy(data);
    const created = new this.model(data);
    return created.save(options);
  }

  async createAll(
    data: Partial<T>[],
    options?: { session?: ClientSession }
  ): Promise<T[]> {
    const created = data.map((item) => {
      this.utilsService.setCreatedAtAndCreatedBy(item);
      return new this.model(item);
    });
    return options?.session
      ? await this.model.insertMany(created, { session: options.session })
      : await this.model.insertMany(created);
  }

  async findById(
    id: string,
    options?: { session?: ClientSession }
  ): Promise<T | null> {
    return this.model
      .findOne({
        _id: id,
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

  async existsById(id: string, options?: { session?: ClientSession }) {
    return this.model
      .exists({
        _id: id,
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

  async findAll(options?: { session?: ClientSession }): Promise<T[]> {
    return this.model
      .find({
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .sort({ updatedAt: -1 })
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
    options?: { session?: ClientSession }
  ): Promise<T | null> {
    data = this.utilsService.setUpdatedAtAndUpdatedBy(data);
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async softDelete(
    id: string,
    options?: { session?: ClientSession }
  ): Promise<T | null> {
    const data = this.utilsService.setDeletedAtAndDeletedBy({});
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async hardDelete(
    id: string,
    options?: { session?: ClientSession }
  ): Promise<T | null> {
    return this.model
      .findByIdAndDelete(id)
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }
}

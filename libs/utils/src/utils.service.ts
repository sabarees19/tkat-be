import { Injectable } from '@nestjs/common';
import { BaseSchemaType, constant } from '@tkat-backend/shared';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ClsService } from 'nestjs-cls';
dayjs.extend(utc);

@Injectable()
export class UtilsService {
  constructor(private readonly clsService: ClsService) {}

  setCreatedAtAndCreatedBy<T extends Partial<BaseSchemaType>>(entity: T): T {
    const createdAt = dayjs.utc().format(constant.UTC_TIME_PATTERN);
    const userId = this.getUserId();
    entity.createdAt = createdAt;
    entity.createdBy = userId;
    entity.updatedAt = createdAt;
    entity.updatedBy = userId;
    return entity;
  }

  setUpdatedAtAndUpdatedBy<T extends Partial<BaseSchemaType>>(entity: T): T {
    const updatedAt = dayjs.utc().format(constant.UTC_TIME_PATTERN);
    const userId = this.getUserId();
    entity.updatedAt = updatedAt;
    entity.updatedBy = userId;
    return entity;
  }

  setDeletedAtAndDeletedBy<T extends Partial<BaseSchemaType>>(entity: T): T {
    const deletedAt = dayjs.utc().format(constant.UTC_TIME_PATTERN);
    const userId = this.getUserId();
    entity.updatedAt = deletedAt;
    entity.updatedBy = userId;
    entity.deletedAt = deletedAt;
    entity.deletedBy = userId;
    return entity;
  }

  isObjectEmpty = (objectName: object) => {
    return (
      objectName &&
      Object.keys(objectName).length === 0 &&
      objectName.constructor === Object
    );
  };

  getUserId(): string {
    return this.clsService.get('session').user.id;
  }
}

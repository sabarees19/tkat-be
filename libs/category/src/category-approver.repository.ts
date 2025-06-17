import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import { CategoryApprover, mongoDbConstant } from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class CategoryApproverRepository extends BaseMongodbRepository<CategoryApprover> {
  constructor(
    @Inject(mongoDbConstant.CATEGORY_APPROVER_MODEL)
    model: Model<CategoryApprover>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async findByCategoryId(
    categoryId: string,
    options?: { session?: ClientSession }
  ): Promise<CategoryApprover[]> {
    return await this.model
      .find({
        categoryId,
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .session(options?.session ?? null)
      .exec();
  }

  async findByApproverId(
    approverId: string,
    options?: { session?: ClientSession }
  ): Promise<CategoryApprover[]> {
    return await this.model
      .find({
        approverId,
        deletedAt: { $eq: undefined },
        deletedBy: { $eq: undefined },
      })
      .session(options?.session ?? null)
      .exec();
  }

  async findByApproverIdAndCategoryId(
    approverId: string,
    categoryId: string,
    options?: { session?: ClientSession }
  ): Promise<CategoryApprover | null> {
    return await this.model.findOne({ approverId, categoryId, deletedAt: { $eq: undefined }, deletedBy: { $eq: undefined } }, options?.session ?? null).exec();
  }
}

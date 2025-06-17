import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import {
  Category,
  DatabaseError,
  databaseErrorEnum,
  mongoDbConstant,
  tableName,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import mongoose, { ClientSession, Model } from 'mongoose';

@Injectable()
export class CategoryRepository extends BaseMongodbRepository<Category> {
  constructor(
    @Inject(mongoDbConstant.CATEGORY_MODEL)
    private categoryModel: Model<Category>,
    utilsService: UtilsService
  ) {
    super(categoryModel, utilsService);
  }

  async findAllCategoryDetails() {
    return this.categoryModel
      .aggregate([
        {
          $match: {
            deletedAt: { $eq: undefined },
            deletedBy: { $eq: undefined },
          },
        },
        {
          $addFields: {
            id: { $toString: '$_id' },
          },
        },
        {
          $lookup: {
            from: tableName.CATEGORY_APPROVER, // Collection name for approvers
            let: { categoryId: '$id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$categoryId', '$$categoryId'],
                  },
                  deletedAt: { $eq: undefined },
                  deletedBy: { $eq: undefined },
                },
              },
              {
                $sort: { approvalOrder: 1 }, 
              },
            ],
            as: 'approvers',
          },
        },
      ])
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async findCategoryDetails(id?: string, options?: { session?: ClientSession }) {
    const matchStage = id
      ? {
          $match: {
            _id: new this.model.base.Types.ObjectId(id),
            deletedAt: { $eq: undefined },
            deletedBy: { $eq: undefined },
          },
        }
      : {
          $match: {
            deletedAt: { $eq: undefined },
            deletedBy: { $eq: undefined },
          },
        };

    const userLookupStage = id
      ? [
          {
            $lookup: {
              from: tableName.USER, // User collection name
              let: { approverId: '$approverId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: [{ $toString: '$_id' }, '$$approverId'] },
                  },
                },
              ],
              as: 'approverDetails',
            },
          },
          {
            $unwind: '$approverDetails',
          },
        ]
      : [];

    return this.categoryModel
      .aggregate([
        matchStage,
        {
          $addFields: {
            id: { $toString: '$_id' },
          },
        },
        {
          $lookup: {
            from: tableName.DEPARTEMNT,
            let: { departmentId: '$departmentId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: '$_id' }, '$$departmentId'] },
                },
              },
            ],
            as: 'departmentDetails',
          },
        },
        {
          $unwind: {
            path: '$departmentDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: tableName.USER,
            let: { createdBy: '$createdBy' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: '$_id' }, '$$createdBy'] },
                },
              },
            ],
            as: 'creatorDetails',
          },
        },
        {
          $unwind: {
            path: '$creatorDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: tableName.CATEGORY_APPROVER, // Collection name for approvers
            let: { categoryId: '$id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$categoryId', '$$categoryId'],
                  },
                  deletedAt: { $eq: undefined },
                  deletedBy: { $eq: undefined },
                },
              },
              {
                $sort: { approvalOrder: 1 },
              },
              ...userLookupStage,
            ],
            as: 'approvers',
          },
        },
        {
          $project: {
            id: 1,
            categoryName: 1,
            categoryCheckName: 1,
            departmentId: 1,
            departmentName: '$departmentDetails.departmentName',
            templateId: 1,
            description: 1,
            approvalFlow: 1,
            createdAt: 1,
            updatedAt: 1,
            createdBy: 1,
            createdByName: '$creatorDetails.userName',
            updatedBy: 1,
            approvers: {
              $map: {
                input: '$approvers',
                as: 'approver',
                in: {
                  approverId: '$$approver.approverId',
                  approverName: '$$approver.approverDetails.userName',
                  employeeId: '$$approver.approverDetails.employeeId',
                  approvalOrder: '$$approver.approvalOrder',
                },
              },
            },
          },
        }
      ])
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async existsByDepartmentIdAndName(
    departmentId: string,
    categoryName: string,
    options?: { session?: ClientSession }
  ) {
    return this.categoryModel
      .exists({
        departmentId,
        categoryName,
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

  async findByDepartmentId(
    departmentId: string,
    options?: { session?: ClientSession }
  ) {
    return this.categoryModel
      .aggregate([
        {
          $match: {
            departmentId,
            deletedAt: { $eq: undefined },
            deletedBy: { $eq: undefined },
          },
        },
        {
          $addFields: {
            id: { $toString: '$_id' },
          },
        },
        {
          $lookup: {
            from: tableName.CATEGORY_APPROVER, // Collection name for approvers
            let: { categoryId: '$id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$categoryId', '$$categoryId'],
                  },
                  deletedAt: { $eq: undefined },
                  deletedBy: { $eq: undefined },
                },
              },
              {
                $sort: { approvalOrder: 1 }, 
              },
              {
                $lookup: {
                  from: tableName.USER, // User collection name
                  let: { approverId: '$approverId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: [ { $toString: '$_id' }, '$$approverId'] },
                      },
                    },
                  ],
                  as: 'approverDetails',
                },
              },
              {
                $unwind: '$approverDetails',
              },
              {
                $addFields: {
                  approverName: '$approverDetails.firstName', // Assuming 'firstName' is the approver's name field
                },
              },
              {
                $project: {
                  approverDetails: 0, // Exclude approverDetails after extracting approverName
                },
              },
            ],
            as: 'approvers',
          },
        },
      ])
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }
}

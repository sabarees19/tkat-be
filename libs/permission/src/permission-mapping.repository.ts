import { Injectable, Inject } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import { DatabaseError, databaseErrorEnum, mongoDbConstant, PermissionMapping, tableName } from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class PermissionMappingRepository extends BaseMongodbRepository<PermissionMapping> {
  constructor(
    @Inject(mongoDbConstant.PERMISSION_MAPPING_MODEL)
    model: Model<PermissionMapping>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async findByUserId(
    userId: string,
    options?: { session?: ClientSession }
  ): Promise<PermissionMapping[]> {
    return await this.model.aggregate([
      { 
        $match: {   
          userId: userId, 
          deletedAt: { $eq: undefined }, 
          deletedBy: { $eq: undefined } 
        } 
      },
      {
        $lookup: {
          from: tableName.PERMISSION,
          let: { permissionId: '$permissionId' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $eq: ['$$permissionId', { $toString: '$_id' }]
                },
                deletedAt: { $eq: undefined },
                deletedBy: { $eq: undefined }
              } 
            },
            {
              $project: {
                id: { $toString: '$_id' },
                permissionName: 1,
                description: 1,
                moduleName: 1,
                subModuleName: 1,
                screenName: 1,
                createdAt: 1,
                createdBy: 1,
                updatedAt: 1,
                updatedBy: 1,
                deletedAt: 1,
                deletedBy: 1
              }
            }
          ],
          as: 'permissionDetails'
        },
      },
      {
        $addFields: {
          permissionDetails: { $first: '$permissionDetails' }
        }
      },
      {
        $project: {
          id: { $toString: '$_id' },
          roleId: 1,
          userId: 1,
          permissionId: 1,
          createdAt: 1,
          createdBy: 1,
          updatedAt: 1,
          updatedBy: 1,
          deletedAt: 1,
          deletedBy: 1,
          permissionDetails: 1
        }
      }
    ]).session(options?.session ?? null).exec().catch((error) => {
      throw new DatabaseError(
        databaseErrorEnum.enum.DATABASE_ERROR,
        { cause: error }
      );
    });
  }

  async findByRoleId(
    roleId: string,
    options?: { session?: ClientSession }
  ): Promise<PermissionMapping[]> {
    return await this.model.aggregate([
      { 
        $match: { 
          roleId: roleId, 
          deletedAt: { $eq: undefined }, 
          deletedBy: { $eq: undefined } 
        } 
      },
      {
        $lookup: {
          from: tableName.PERMISSION,
          let: { permissionId: '$permissionId' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $eq: ['$$permissionId', { $toString: '$_id' }]
                },
                deletedAt: { $eq: undefined },
                deletedBy: { $eq: undefined }
              } 
            },
            {
              $project: {
                id: { $toString: '$_id' },
                permissionName: 1,
                description: 1,
                moduleName: 1,
                subModuleName: 1,
                screenName: 1,
                createdAt: 1,
                createdBy: 1,
                updatedAt: 1,
                updatedBy: 1,
                deletedAt: 1,
                deletedBy: 1
              }
            }
          ],
          as: 'permissionDetails'
        },
      },
      {
        $addFields: {
          permissionDetails: { $first: '$permissionDetails' }
        }
      },
      {
        $project: {
          id: { $toString: '$_id' },
          roleId: 1,
          userId: 1,
          permissionId: 1,
          createdAt: 1,
          createdBy: 1,
          updatedAt: 1,
          updatedBy: 1,
          deletedAt: 1,
          deletedBy: 1,
          permissionDetails: 1
        }
      }
    ]).session(options?.session ?? null).exec().catch((error) => {
      throw new DatabaseError(
        databaseErrorEnum.enum.DATABASE_ERROR,
        { cause: error }
      );
    });
  }

  async hasPermission(permissionId: string[], roleId: string) {
    return this.model.aggregate([
      { $match: { permissionId: { $in: permissionId }, roleId: roleId, deletedAt: { $eq: undefined }, deletedBy: { $eq: undefined } } },
    ]).exec().catch((error) => {
      throw new DatabaseError(
        databaseErrorEnum.enum.DATABASE_ERROR,
        { cause: error }
      );
    });
  }
}

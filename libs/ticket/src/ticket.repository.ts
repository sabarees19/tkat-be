import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import {
  DatabaseError,
  databaseErrorEnum,
  mongoDbConstant,
  Ticket,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import mongoose, { ClientSession, Model, PipelineStage } from 'mongoose';

@Injectable()
export class TicketRepository extends BaseMongodbRepository<Ticket> {
  constructor(
    @Inject(mongoDbConstant.TICKET_MODEL)
    model: Model<Ticket>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async findTicket(
    requesterId?: string,
    id?: string,
    isTicketClosed?: boolean,
    assignerId?: string,
    options?: { session?: ClientSession }
  ) {
    const matchStage: any = {};
    if (id) matchStage._id = new mongoose.Types.ObjectId(id);
    if (requesterId) matchStage.requesterId = requesterId;
    if (isTicketClosed !== undefined)
      matchStage.isTicketClosed = isTicketClosed;
    if (assignerId) matchStage.assignerId = assignerId;
    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'users',
          let: { requesterId: '$requesterId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$requesterId'],
                },
              },
            },
          ],
          as: 'requester',
        },
      },
      {
        $unwind: '$requester',
      },
      {
        $lookup: {
          from: 'users',
          let: { assignerId: '$assignerId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$assignerId'],
                },
              },
            },
          ],
          as: 'assigner',
        },
      },
      {
        $unwind: {
          path: '$assigner',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    if (id) {
      pipeline.push(
        {
          $lookup: {
            from: 'departments',
            let: { departmentId: '$departmentId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: '$_id' }, '$$departmentId'],
                  },
                },
              },
            ],
            as: 'department',
          },
        },
        {
          $unwind: {
            path: '$department',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'categories',
            let: { categoryId: '$categoryId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: '$_id' }, '$$categoryId'],
                  },
                },
              },
            ],
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    pipeline.push({
      $project: {
        id: { $toString: '$_id' },
        ticketId: 1,
        status: 1,
        departmentId: 1,
        departmentName: '$department.departmentName',
        categoryId: 1,
        categoryName: '$category.categoryName',
        requesterId: 1,
        assignerId: 1,
        description: 1,
        createdAt: 1,
        createdBy: 1,
        updatedAt: 1,
        updatedBy: 1,
        priority: 1,
        approvalFlow: 1,
        isTicketClosed: 1,
        requesterUserName: '$requester.userName',
        requesterEmployeeId: '$requester.employeeId',
        assignerUserName: '$assigner.userName',
        assignerEmployeeId: '$assigner.employeeId',
      },
    });

    return this.model
      .aggregate(pipeline)
      .session(options?.session ?? null)
      .then((result) => (id ? result[0] ?? null : result))
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }
}

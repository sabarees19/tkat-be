import { Inject, Injectable } from '@nestjs/common';
import { BaseMongodbRepository } from '@tkat-backend/core';
import {
  DatabaseError,
  databaseErrorEnum,
  mongoDbConstant,
  TicketParticipants,
} from '@tkat-backend/shared';
import { UtilsService } from '@tkat-backend/utils';
import { ClientSession, Model, PipelineStage } from 'mongoose';

@Injectable()
export class TicketParticipantsRepository extends BaseMongodbRepository<TicketParticipants> {
  constructor(
    @Inject(mongoDbConstant.TICKET_PARTICIPANTS_MODEL)
    model: Model<TicketParticipants>,
    utilsService: UtilsService
  ) {
    super(model, utilsService);
  }

  async findTicketParticipantsByTicketId(
    ticketId: string,
    options?: { session?: ClientSession }
  ) {
    return this.model
      .aggregate([
        {
          $match: {
            ticketId,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: '$_id' }, '$$userId'], // Convert _id to string and compare
                  },
                },
              },
            ],
            as: 'participants',
          },
        },
        {
          $unwind: '$participants',
        },
        {
          $project: {
            id: { $toString: '$_id' },
            ticketId: 1,
            userType: 1,
            userId: 1,
            approvalOrder: 1,
            createdAt: 1,
            createdBy: 1,
            updatedAt: 1,
            updatedBy: 1,
            approverStatus: 1,
            reason: 1,
            userName: '$participants.userName',
            employeeId: '$participants.employeeId',
          },
        },
      ])
      .session(options?.session ?? null)
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async existsByIdAndApprovalOrder(
    ticketId: string,
    approvalOrder: number,
    options?: { session?: ClientSession }
  ) {
    return this.model
      .findOne({ ticketId, approvalOrder })
      .session(options?.session ?? null)
      .exec()
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }

  async findParticpantsTicket(
    userType: string,
    userId: string,
    approverStatus?: string,
    isTicketClosed?: boolean,
    options?: { session?: ClientSession }
  ) {
    const matchStage: any = {};
    if (userId) matchStage.userId = userId;
    if (userType) matchStage.userType = userType;
    if (approverStatus) matchStage.approverStatus = approverStatus;
    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'tickets',
          let: { ticketId: '$ticketId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $toString: '$_id' }, '$$ticketId'] },
                    ...(isTicketClosed !== undefined
                      ? [{ $eq: ['$isTicketClosed', isTicketClosed] }]
                      : []),
                  ],
                },
              },
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
              $unwind: {
                path: '$requester',
                preserveNullAndEmptyArrays: true,
              },
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
          ],
          as: 'ticket',
        },
      },
      {
        $unwind: '$ticket',
      },
      {
        $addFields: {
          'ticket.approverStatus': '$approverStatus',
          'ticket.approverId': '$userId',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$ticket',
        },
      },
      {
        $project: {
          id: { $toString: '$_id' },
          ticketId: 1,
          status: 1,
          departmentId: 1,
          categoryId: 1,
          requesterId: 1,
          assignerId: 1,
          requesterUserName: '$requester.userName',
          requesterEmployeeId: '$requester.employeeId',
          assignerUserName: '$assigner.userName',
          assignerEmployeeId: '$assigner.employeeId',
          description: 1,
          priority: 1,
          approvalFlow: 1,
          isTicketClosed: 1,
          createdAt: 1,
          createdBy: 1,
          updatedAt: 1,
          updatedBy: 1,
          approverStatus: 1,
          approverId: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    return this.model
      .aggregate(pipeline)
      .session(options?.session ?? null)
      .then((result) => result ?? [])
      .catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }
}

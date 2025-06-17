import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { DatabaseError, databaseErrorEnum, Question } from "@tkat-backend/shared";
import { BaseMongodbRepository } from "@tkat-backend/core";
import { mongoDbConstant } from "@tkat-backend/shared";
import { UtilsService } from "@tkat-backend/utils";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class QuestionRepository extends BaseMongodbRepository<Question> {
  constructor(
    @Inject(mongoDbConstant.QUESTION_MODEL)
    private questionModel: Model<Question>,
    utilsService: UtilsService
  ) {
    super(questionModel, utilsService);
  }

  async findQuestionsByTemplateId(templateId: string, options?: { session?: ClientSession }) {
    return this.questionModel.find({ templateId, deletedAt: { $eq: undefined }, deletedBy: { $eq: undefined } }).sort({ position: 1 }).session(options?.session ?? null).exec().catch((error) => {
        throw new DatabaseError(databaseErrorEnum.enum.DATABASE_ERROR, {
          cause: error,
        });
      });
  }
}

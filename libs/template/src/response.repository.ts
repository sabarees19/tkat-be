import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { BaseMongodbRepository } from "@tkat-backend/core";
import { mongoDbConstant, Response } from "@tkat-backend/shared";
import { UtilsService } from "@tkat-backend/utils";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class ResponseRepository extends BaseMongodbRepository<Response> {
  constructor(
    @Inject(mongoDbConstant.RESPONSE_MODEL)
    private responseModel: Model<Response>,
    utilsService: UtilsService
  ) {
    super(responseModel, utilsService);
  }

  async findResponseByTicketId(ticketId: string, options?: { session?: ClientSession }): Promise<Response[]> {
    return this.responseModel
      .find({ ticketId })
      .session(options?.session ?? null)
      .exec();
  }
}

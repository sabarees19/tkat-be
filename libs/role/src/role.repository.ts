import { Inject } from "@nestjs/common";
import { BaseMongodbRepository } from "@tkat-backend/core";
import { mongoDbConstant, Role } from "@tkat-backend/shared";
import { UtilsService } from "@tkat-backend/utils";
import { Model } from "mongoose";

export class RoleRepository extends BaseMongodbRepository<Role> {
    constructor(
        @Inject(mongoDbConstant.ROLE_MODEL) model: Model<Role>,
        utilsService: UtilsService
    ) {
        super(model, utilsService);
    }
}
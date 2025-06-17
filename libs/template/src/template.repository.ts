import { Inject, Injectable } from "@nestjs/common";
import { BaseMongodbRepository } from "@tkat-backend/core";
import { Template } from "@tkat-backend/shared";
import { mongoDbConstant } from "@tkat-backend/shared";
import { UtilsService } from "@tkat-backend/utils";
import { ClientSession, Model } from "mongoose";

@Injectable()
export class TemplateRepository extends BaseMongodbRepository<Template> {
  constructor(
    @Inject(mongoDbConstant.TEMPLATE_MODEL)
    private templateModel: Model<Template>,
    utilsService: UtilsService
  ) {
    super(templateModel, utilsService);
  }

  async generateUniqueName(options?: { session?: ClientSession }): Promise<string> {
    const result = await this.templateModel
      .aggregate([
        {
          $match: {
            deletedAt: { $exists: false },
            deletedBy: { $exists: false },
            title: { $regex: /^Untitled(?:_\d+)?$/ },
          },
        },
        {
          $project: {
            number: {
              $cond: {
                if: { $regexMatch: { input: "$title", regex: /^Untitled_\d+$/ } },
                then: { $toInt: { $arrayElemAt: [{ $split: ['$title', '_'] }, 1] } },
                else: 0
              }
            }
          }
        },
        { $sort: { number: 1 } },
        {
          $group: {
            _id: null,
            numbers: { $push: "$number" }
          }
        },
        {
          $project: {
            nextNumber: {
              $let: {
                vars: {
                  // Create array [1,2,3,...,n+1] where n is the count of numbers
                  sequence: { 
                    $range: [1, { $add: [{ $size: "$numbers" }, 2] }] 
                  }
                },
                in: {
                  // Find first number in sequence that's not in our numbers array
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$$sequence",
                        as: "seq",
                        cond: { $not: { $in: ["$$seq", "$numbers"] } }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      ])
      .session(options?.session ?? null);

    const nextNumber = result[0]?.nextNumber ?? 1;
    return `Untitled_${nextNumber}`;
  }

  findByName(name: string, options?: { session?: ClientSession }): Promise<Template | null> {
    return this.templateModel
      .findOne({ title: name })
      .session(options?.session ?? null)
      .exec();
  }
}

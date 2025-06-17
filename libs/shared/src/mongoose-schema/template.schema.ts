import { Connection } from "mongoose";
import { BaseDocument, baseSchema } from "./base.schema";
import { Schema } from "mongoose";
import { mongoDbConstant } from "../constant/mongodb";
import { tableName } from "../constant/table-name";

 export const templateSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  ...baseSchema.obj,
});

export interface Template extends BaseDocument {
  title: string;
  description?: string;
}

export const templateModelProvider = {
  provide: mongoDbConstant.TEMPLATE_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Template>(tableName.TEMPLATE, templateSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};
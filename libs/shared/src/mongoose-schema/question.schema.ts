import { BaseDocument, baseSchema } from "./base.schema";
import { Connection, Schema } from "mongoose";
import { mongoDbConstant } from "../constant/mongodb";
import { tableName } from "../constant/table-name";

export const questionSchema = new Schema({
  required: { type: Boolean, required: true },
  position: { type: Number, required: true },
  templateId: { type: String, required: true },
  question: { type: Schema.Types.Mixed, required: true },
  ...baseSchema.obj,
});

export interface Question extends BaseDocument {
  required: boolean;
  position: number;
  templateId: string;
  question: any;
}

export const questionModelProvider = {
  provide: mongoDbConstant.QUESTION_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Question>(tableName.QUESTION, questionSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};
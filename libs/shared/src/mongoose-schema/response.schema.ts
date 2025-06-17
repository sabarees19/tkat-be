import { BaseDocument, baseSchema } from "./base.schema";
import { tableName } from "../constant/table-name";
import { mongoDbConstant } from "../constant/mongodb";
import { Connection, Schema } from "mongoose";

export const responseSchema = new Schema({
  ticketId: { type: String, required: true },
  question: { type: Schema.Types.Mixed, required: true },
  response: { type: Schema.Types.Mixed, required: true },
  ...baseSchema.obj,
});

export interface Response extends BaseDocument {
  ticketId: string;
  question: any;
  response: any;
}

export const responseModelProvider = {
  provide: mongoDbConstant.RESPONSE_MODEL,
  useFactory: (connection: Connection) =>
    connection.model<Response>(tableName.RESPONSE, responseSchema),
  inject: [mongoDbConstant.MONGO_DB_CONNECTION],
};
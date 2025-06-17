import { Schema, Document } from "mongoose";

export const baseSchema = new Schema({
  createdAt: { type: String, required: true },
  createdBy: { type: String, required: true },
  updatedAt: { type: String, required: true },
  updatedBy: { type: String, required: true },
  deletedAt: { type: String },
  deletedBy: { type: String },
});

export interface BaseDocument extends Document {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string;
  deletedBy?: string;
}

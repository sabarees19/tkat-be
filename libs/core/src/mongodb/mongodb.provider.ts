import { mongoDbConstant } from "@tkat-backend/shared";
import mongoose from "mongoose";
import { EnvService } from "../env/env.service";

export const mongodbProvider = [
    {
        provide: mongoDbConstant.MONGO_DB_CONNECTION,
        useFactory: (envService: EnvService): Promise<typeof mongoose> =>
            mongoose.connect(envService.get('MONGODB_URI')),
        inject: [EnvService],
    }
];

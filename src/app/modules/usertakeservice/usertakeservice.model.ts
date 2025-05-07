import { Schema, model } from "mongoose";
import { IUserTakeService } from "./usertakeservice.interface";

const userTakeServiceSchema = new Schema<IUserTakeService>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "completed"],
      default: "pending",
    },
    additionalInfo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const UserTakeService = model<IUserTakeService>(
  "UserTakeService",
  userTakeServiceSchema
);

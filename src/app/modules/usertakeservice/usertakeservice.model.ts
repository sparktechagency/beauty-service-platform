import { Schema, model } from "mongoose";
import { IUserTakeService } from "./usertakeservice.interface";

const userTakeServiceSchema = new Schema<IUserTakeService>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceManagement",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artiestId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isBooked:{
      type:Boolean,
      default:false
    },
    price:{
      type:Number,
    },
    addOns:{
      type:[String]
    },
    app_fee:{
      type:Number
    },
    total_amount:{
      type:Number
    },
    payment_intent:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

export const UserTakeService = model<IUserTakeService>(
  "UserTakeService",
  userTakeServiceSchema
);

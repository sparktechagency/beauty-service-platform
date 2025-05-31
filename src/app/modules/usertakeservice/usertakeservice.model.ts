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
      enum: ["pending", "inProgress", "completed", "cancelled", "processing"],
      default: "pending",
    },
    additionalInfo: {
      type: String,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    addOns: {
      type: [{
        type: {
          name: String,
          price: Number,
        },
      }],
    },
    app_fee: {
      type: Number,
    },
    total_amount: {
      type: Number,
    },
    payment_intent: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    artist_book_date:{
      type:Date
    },
    cancelled_by:{
      type:String,
      enum:["user","artist","admin"]
    },
    cancelled_reason:{
      type:String
    },
    cancel_status:{
      type:String,
      enum:["low","high"]
    },
    trxId:{
      type:String
    },
    artist_app_fee:{
      type:Number
    },
    refund:{
      type:Boolean,
      default:false
    },
    refund_amount:{
      type:Number
    },
    service_date:{
      type:Date
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

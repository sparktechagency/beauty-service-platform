import { Schema, model } from "mongoose";
import { IUserTakeService } from "./usertakeservice.interface";
import { User } from "../user/user.model";

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
      type: [
        {
          type: {
            name: String,
            price: Number,
          },
        },
      ],
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
    artist_book_date: {
      type: Date,
    },
    cancelled_by: {
      type: String,
      enum: ["user", "artist", "admin"],
    },
    cancelled_reason: {
      type: String,
    },
    cancel_status: {
      type: String,
      enum: ["low", "high"],
    },
    trxId: {
      type: String,
    },
    artist_app_fee: {
      type: Number,
    },
    refund: {
      type: Boolean,
      default: false,
    },
    refund_amount: {
      type: Number,
    },
    service_date: {
      type: Date,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    isOnTheWay: {
      type: Boolean,
    },
    arriveTime: {
      type: Date,
    },
    isServiceStart: {
      type: Boolean,
      default: false,
    },
    specficOrder: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

userTakeServiceSchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate();
  const user = update?.artiestId;

  if (user) {
    await User.findOneAndUpdate(
      { _id: user },
      {
        last_accept_date: update.service_date,
      }
    );
  }

  next();
});

export const UserTakeService = model<IUserTakeService>(
  "UserTakeService",
  userTakeServiceSchema
);

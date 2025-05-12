import { model, Schema, Types } from "mongoose";
import { INotification, NotificationModel } from "./notification.interface";

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    title: {
      type: String,
      required: true,
    },
    receiver: {
      type:Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    filePath: {
      type: String,
      enum: ["request", "booking", "payment"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification, NotificationModel>(
  "Notification",
  notificationSchema
);

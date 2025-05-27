import { Model, Types } from "mongoose";

export type INotification = {
  userId?: Types.ObjectId;
  receiver?: Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  filePath?: "request" | "booking" | "payment";
  serviceId?: Types.ObjectId;
  readers?: Types.ObjectId[];
};

export type NotificationModel = Model<INotification>;

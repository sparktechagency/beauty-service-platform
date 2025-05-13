import { Types } from "mongoose";

export type IUserTakeService = {
  serviceId: Types.ObjectId;
  userId: Types.ObjectId;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  status: "pending" | "inProgress" | "completed";
  providerId?: Types.ObjectId;
  isBooked?: boolean;
  artiestId?: Types.ObjectId;
  address: string;
};

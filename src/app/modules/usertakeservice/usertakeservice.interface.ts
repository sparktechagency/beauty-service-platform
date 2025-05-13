import { Types } from "mongoose";

export type IUserTakeService = {
  serviceId: Types.ObjectId;
  userId: Types.ObjectId;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  status: "pending" | "inProgress" | "completed" | "cancelled";
  providerId?: Types.ObjectId;
  isBooked?: boolean;
  artiestId?: Types.ObjectId;
  price: number;
  addOns?:string[],
  app_fee?:number,
  total_amount?:number,
  payment_intent: string;
};

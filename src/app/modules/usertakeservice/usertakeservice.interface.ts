import { Types } from "mongoose";

export type IUserTakeService = {
  serviceId: Types.ObjectId;
  userId: Types.ObjectId;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  status: "pending" | "inProgress"| "processing" | "completed" | "cancelled";
  providerId?: Types.ObjectId;
  isBooked?: boolean;
  artiestId?: Types.ObjectId;
  price: number;
  addOns?:string[],
  app_fee?:number,
  total_amount?:number,
  payment_intent: string;
  artist_book_date?: Date;
  cancelled_by?: "user" | "artist"|"admin",
  cancelled_reason?: string;
  artist_app_fee?:number,
  cancel_status?:"low"|"high",
  trxId?:string,
  address:string,
  createdAt?: Date;
};

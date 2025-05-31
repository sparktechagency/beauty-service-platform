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
  addOns?:{
    name:string,
    price:number
  },
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
  refund?: boolean;
  refund_amount?:number,
  date?: Date;
  time?: string;
  service_date?: Date;
};

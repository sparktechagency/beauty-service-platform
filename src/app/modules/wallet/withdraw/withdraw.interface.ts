import { Model, Types } from "mongoose";
import { WITHDRAW_STATUS } from "../../../../enums/withdraw";

export type Iwithdraw = {
  user: Types.ObjectId;
  amount: number;
  status:WITHDRAW_STATUS;
  transactionId: string;
};

export type WithdrawModel = Model<Iwithdraw, Record<string, any>>;
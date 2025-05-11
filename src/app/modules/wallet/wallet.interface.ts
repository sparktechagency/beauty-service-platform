import { Model } from "mongoose";
import { Types } from "mongoose";

export type IWallet = {
  user: Types.ObjectId;
  balance: number;
  status:"active" | "inactive";
};
export type WalletModel = Model<IWallet, Record<string, unknown>>;
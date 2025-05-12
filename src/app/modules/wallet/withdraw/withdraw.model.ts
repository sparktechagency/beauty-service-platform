import { model, Schema } from "mongoose";
import { IWallet, WalletModel } from "../wallet.interface";
import { Iwithdraw, WithdrawModel } from "./withdraw.interface";
import { WITHDRAW_STATUS } from "../../../../enums/withdraw";

const walletSchema = new Schema<Iwithdraw, WithdrawModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(WITHDRAW_STATUS),
      default: WITHDRAW_STATUS.PENDING,
    },
    transactionId: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);
export const Widthdraw = model<Iwithdraw, WithdrawModel>("withdraw", walletSchema);
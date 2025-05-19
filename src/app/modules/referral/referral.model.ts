import { model, Schema } from "mongoose";
import { IReferral, ReferralModel } from "./referral.interface";

const referralSchema = new Schema<IReferral, ReferralModel>(
  {
    referralCode: {
      type: String,
      required: true,
    },
    token_user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    referral_user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const Referral = model<IReferral, ReferralModel>("Referral", referralSchema);
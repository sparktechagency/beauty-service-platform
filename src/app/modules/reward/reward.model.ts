import { model, Schema } from "mongoose";
import { IReward, RewardModel } from "./reward.interface";

const rewardSchema = new Schema<IReward,RewardModel>(
  {
    amount: {
      type: Number,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    occation: {
      type: String,
      enum: ["Review", "UserTakeService", "Referral", "Subscription"],
      required: true,
    },
    occationId: {
      type: Schema.Types.ObjectId,
      refPath: "occation",
      required: true,
    },
    title: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);


export const Reward = model<IReward, RewardModel>("Reward", rewardSchema);
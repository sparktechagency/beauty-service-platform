import { Model, Types } from "mongoose";

export type IReward = {
    amount: number;
    user: Types.ObjectId;
    occation:"Review"|"UserTakeService"|"Referral"|"Subscription",
    occationId: Types.ObjectId;
    title?: string;
}

export type RewardModel = Model<IReward, Record<string, unknown>>;
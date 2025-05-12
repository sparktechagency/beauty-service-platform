import { Model, Types } from "mongoose";

export type IReferral = {
    referralCode: string;
    token_user?:Types.ObjectId;
    referral_user:Types.ObjectId;
    status:"pending"|"accepted"|"rejected";
    amount:number;
};

export type ReferralModel = Model<IReferral, Record<string, any>>;

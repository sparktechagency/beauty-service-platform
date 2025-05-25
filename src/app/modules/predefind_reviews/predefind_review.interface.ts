import { Model, Types } from "mongoose";

export type IPredefiendReview = {
    category: Types.ObjectId;
    reviews:string[],
};

export type IGeneralReview = {
    review:string[]
}

export type GeneralModel = Model<IGeneralReview>;
export type IPredefiendReviewModel = Model<IPredefiendReview>;
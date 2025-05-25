import { model, Schema } from "mongoose";
import { GeneralModel, IGeneralReview, IPredefiendReview, IPredefiendReviewModel } from "./predefind_review.interface";

const preDefindReviewSchema = new Schema<IPredefiendReview,IPredefiendReviewModel>({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  reviews: [
    {
      type: String,
      required: true,
    },
  ],
});

const generalReviewSchema = new Schema<IGeneralReview, GeneralModel>({
  review: [
    {
      type: String,
      required: true,
    },
  ],
});

export const GeneralReview = model<IGeneralReview, GeneralModel>("GeneralReview", generalReviewSchema);

export const PredefiendReview = model<IPredefiendReview, IPredefiendReviewModel>(
  "PredefiendReview",
  preDefindReviewSchema
);
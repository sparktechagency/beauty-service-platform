import { model, Schema } from "mongoose";
import { IReview, ReviewModel } from "./review.interface";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const Service:any = [] ;

const reviewSchema = new Schema<IReview, ReviewModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        artist: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "UserTakeService",
            required: true,
        },
        comment: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        tip: {
            type: Number,
            required: false
        },
        trxId: {
            type: String,
            required: false
        }

    },
    { timestamps: true }
);



export const Review = model<IReview, ReviewModel>("Review", reviewSchema);
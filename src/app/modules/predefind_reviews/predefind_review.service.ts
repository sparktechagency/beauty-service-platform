import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPredefiendReview } from "./predefind_review.interface";
import { PredefiendReview } from "./predefind_review.model";

const createPredefiendReview = async (
  data: IPredefiendReview
): Promise<IPredefiendReview | null> => {
    const existReviews = await PredefiendReview.findOne({
    category:data.category,
  });
  if(existReviews){
    return await  PredefiendReview.findByIdAndUpdate(existReviews._id,data,{
      new:true
    })
  }

  return await PredefiendReview.create(data);
};

const updatePredefiendReview = async (
  id: string,
  data: Partial<IPredefiendReview>
): Promise<IPredefiendReview | null> => {
  return await PredefiendReview.findByIdAndUpdate(id, data, {
    new: true,
  });
};

const deletePredefiendReview = async (
  id: string
): Promise<IPredefiendReview | null> => {
  return await PredefiendReview.findByIdAndDelete(id);
};
const getAllPredefiendReview = async (catagoryId:string)                             => {}


export const PredefiendReviewService = {
  createPredefiendReview,
  deletePredefiendReview,
  getAllPredefiendReview,
};
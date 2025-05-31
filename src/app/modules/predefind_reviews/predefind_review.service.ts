import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPredefiendReview } from "./predefind_review.interface";
import { GeneralReview, PredefiendReview } from "./predefind_review.model";
import QueryBuilder from "../../builder/queryBuilder";

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

const createGeneralReview = async (
  data: string[]
) => {
  const existReviews = await GeneralReview.findOne({});
  if(existReviews){
    return await  GeneralReview.findByIdAndUpdate(existReviews._id,data,{
      new:true
    })
  }
  return await GeneralReview.create(data);
}

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
const getAllPredefiendReview = async (catagoryId:string)=> {
  const result = await PredefiendReview.findOne({category:catagoryId}).populate('category').lean()
  if(!result){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Predefiend Review not found");
  }
  const general = await GeneralReview.findOne({})
  return {
    ...result,
    general
  }
}

const getGeneralReviews = async ()=> {
  const result = await GeneralReview.findOne({})
  if(!result){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Predefiend Review not found");
  }
  return result
}

const getReviewsForAdmin = async (query:Record<string,any>) => {
  const result = new QueryBuilder(PredefiendReview.find({}), query).sort().paginate()

  const reviews = await result.modelQuery.populate([
    {
      path: "category",
      select: "name",
    },
  ])

  const paginationInfo = await result.getPaginationInfo()

  return {
    reviews,
    paginationInfo
  }
}

export const PredefiendReviewService = {
  createPredefiendReview,
  deletePredefiendReview,
  getAllPredefiendReview,
  updatePredefiendReview,
  createGeneralReview,
  getGeneralReviews,
  getReviewsForAdmin
};
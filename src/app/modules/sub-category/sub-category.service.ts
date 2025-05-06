import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ISubCategory } from "./sub-category.interface";
import { SubCategory } from "./sub-category.model";

const createSubCategoryIntoDB = async (payload: ISubCategory) => {
  const result = await SubCategory.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "Failed to create sub-category"
    );
  }
  return result;
};

const getAllSubCategoryFromDB = async () => {
  const result = await SubCategory.find().populate({
    path: "category",
    select: "name image",
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  return result;
};

const getSingleSubCategoryFromDB = async (id: string) => {
  const result = await SubCategory.findById(id).populate({
    path: "category",
    select: "name image",
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  return result;
};
const updateSubCategoryIntoDB = async (id: string, payload: ISubCategory) => {
  const result = await SubCategory.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  return result;
}


const deleteSubCategoryFromDB = async(id:string) => {
    const result = await SubCategory.findByIdAndDelete(id);
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
    }
    return result;
}

export const SubCategoryServices = {
    createSubCategoryIntoDB,
    getAllSubCategoryFromDB,
    getSingleSubCategoryFromDB,
    updateSubCategoryIntoDB,
    deleteSubCategoryFromDB,    
};

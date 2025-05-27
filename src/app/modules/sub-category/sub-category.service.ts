import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ISubCategory } from "./sub-category.interface";
import { SubCategory } from "./sub-category.model";
import { Types } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { pipeline } from "winston-daily-rotate-file";
import unlinkFile from "../../../shared/unlinkFile";

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

const getAllSubCategoryFromDB = async (category?: string) => {
  const result = await SubCategory.find(category ? { category } : {}).populate({
    path: "category",
    select: "name image",
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  return result;
};

const getAServiceFromDB = async (
  category: string,
  query: Record<string, any>,
  user: JwtPayload
) => {
  if (!Types.ObjectId.isValid(category)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category ID");
  }

  const UserData = await User.findById(user.id);
  console.log(UserData);

  const limit = parseInt(query.limit as string) || 10;
  const page = parseInt(query.page as string) || 1;
  const skip = (page - 1) * limit;

  const matchStage = {
    $match: {
      category: new Types.ObjectId(category),
    },
  };

  const lookupCategoryStage = {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "category",
    },
  };

  const unwindCategoryStage = {
    $unwind: "$category",
  };

  const lookupServiceStage = {
    $lookup: {
      from: "servicemanagements",
      localField: "_id",
      foreignField: "subCategory",
      as: "services",
      pipeline: UserData?.badge
        ? []
        : [
            {
              $match: {
                statePrices: {
                  $elemMatch: {
                    state: UserData?.state,
                  },
                },
              },
            },
            {
              $set: {
                statePrices: {
                  $filter: {
                    input: "$statePrices",
                    as: "statePrice",
                    cond: { $eq: ["$$statePrice.state", UserData?.state] },
                  },
                },
              },
            },
            {
              $set: {
                basePrice: {
                  $let: {
                    vars: {
                      firstStatePrice: { $first: "$statePrices" },
                    },
                    in: "$$firstStatePrice.price",
                  },
                },
              },
            },
          ],
    },
  };

  const facetStage = {
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }],
    },
  };

  const result = await SubCategory.aggregate([
    matchStage,
    lookupCategoryStage,
    unwindCategoryStage,
    lookupServiceStage,
    facetStage,
  ]);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data,
  };
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
  const exist = await SubCategory.findById(id);
  if (!exist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  if (payload.image) {
    unlinkFile(exist.image);
  }
  const result = await SubCategory.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  return result;
};

const deleteSubCategoryFromDB = async (id: string) => {
  const result = await SubCategory.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub-category doesn't exist");
  }
  return result;
};

export const SubCategoryServices = {
  createSubCategoryIntoDB,
  getAllSubCategoryFromDB,
  getSingleSubCategoryFromDB,
  updateSubCategoryIntoDB,
  deleteSubCategoryFromDB,
  getAServiceFromDB,
};

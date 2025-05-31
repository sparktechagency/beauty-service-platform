import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IServiceManagement } from "./servicemanagement.interface";
import { ServiceManagement } from "./servicemanagement.model";
import QueryBuilder from "../../builder/queryBuilder";
import unlinkFile from "../../../shared/unlinkFile";
import { paginateHelper } from "../../../helpers/paginateHelper";
import usStates from "../../../demoData/states";


const createServiceManagementIntoDB = async (payload: IServiceManagement) => {
  const existingService = await ServiceManagement.findOne({
    name: payload.name,
    status:{
      $ne:"deleted"
    }
  });
  if (existingService) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "ServiceManagement already exists"
    );
  }
  const result = await ServiceManagement.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "ServiceManagement not created"
    );
  }
  return result;
};

const getAllServiceManagementFromDB = async (
  query: Record<string, any>
) => {
  const serviceQuery = ServiceManagement.find({status:{$ne: "deleted"}});
  const queryBuilder = new QueryBuilder(
    serviceQuery,
    query
  )
  // const searchAbleFields = ["name", "basePrice", "category", "SubCategory"];
  const selectedFields = { category: "name", subCategory: "name" };
  const resultQuery = queryBuilder
    // .search(searchAbleFields)
    .filter()
    .paginate()
    .populate(["category", "subCategory"], selectedFields);
  const data = await resultQuery.modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();
  if (!data) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "ServiceManagement not found");
  }

  return {
    meta: pagination,
    data,
  };
};


const categoryWiseAndSubCategoryWiseServiceManagementFromDB = async (
  query: Record<string, unknown>
) => {
  const total = await ServiceManagement.countDocuments({
    status: { $ne: "deleted" },
  });
  const limit = query.limit ? parseInt(query.limit as string) : 10;
  const page = query.page ? parseInt(query.page as string) : 1;
  const skip = (page-1) * limit
  const serviceManagents = await ServiceManagement.aggregate([
    {
      $match: {
        status: { $ne: "deleted" },
      },
    },
    {
      $group: {
        _id: {
          category: "$category",
          subCategory: "$subCategory",
        },
        data: { $push: "$$ROOT" },
      },
      
    },
    {
      $project: {
        _id:0,
        data: 1,
      },
    },
    {
      $unwind: "$data",
        
    },
    {
      $replaceRoot: {
        newRoot:"$data"
      }
    },
  {
      $lookup: {
        from: "categories", // your actual Category collection name
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Lookup SubCategory
    {
      $lookup: {
        from: "subcategories", // your actual SubCategory collection name
        localField: "subCategory",
        foreignField: "_id",
        as: "subCategory",
      },
    },
    {
      $unwind: {
        path: "$subCategory",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Sort newest first (optional)
    {
      $skip: skip,
    },
    {
      $limit: limit,
    }

  ]);
  const meta={
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }

  return {
    meta,
    data: serviceManagents
  }
}
const getSingleServiceManagementFromDB = async (id: string) => {
  const result = await ServiceManagement.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "ServiceManagement not found");
  }
  return result;
};
const updateServiceManagementIntoDB = async (
  id: string,
  payload: Partial<IServiceManagement>
) => {

  
  const existServiceManagement = await ServiceManagement.findById(id);
  if (!existServiceManagement) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "ServiceManagement not found");
  }
  if(payload.image){
    unlinkFile(existServiceManagement.image)
  }
  const result = await ServiceManagement.findOneAndUpdate(
    { _id: id },
    payload,
    { new: true }
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "ServiceManagement not found");
  }
  return result;
};
const deleteServiceManagementFromDB = async (id: string) => {
  const result = await ServiceManagement.findByIdAndUpdate(id,{status:"deleted"},{new:true});
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "ServiceManagement not found");
  }
  return result;
};

const statsDataFromArray = async ()=>{
return usStates
}
export const ServiceManagementServices = {
  createServiceManagementIntoDB,
  getAllServiceManagementFromDB,
  getSingleServiceManagementFromDB,
  updateServiceManagementIntoDB,
  deleteServiceManagementFromDB,
  statsDataFromArray,
  categoryWiseAndSubCategoryWiseServiceManagementFromDB
};

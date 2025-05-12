import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IServiceManagement } from "./servicemanagement.interface";
import { ServiceManagement } from "./servicemanagement.model";
import QueryBuilder from "../../builder/queryBuilder";

const createServiceManagementIntoDB = async (payload: IServiceManagement) => {
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
  query: Record<string, unknown>
) => {
  const serviceQuery = ServiceManagement.find({});
  const queryBuilder = new QueryBuilder(
    serviceQuery,
    query
  );
  const searchAbleFields = ["name", "basePrice", "category", "SubCategory"];
  const selectedFields = { category: "name", subCategory: "name" };
  const resultQuery = queryBuilder
    .search(searchAbleFields)
    .filter()
    .sort()
    .paginate()
    .populate(["category", "SubCategory"], selectedFields);
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
  const result = await ServiceManagement.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "ServiceManagement not found");
  }
  return result;
};
export const ServiceManagementServices = {
  createServiceManagementIntoDB,
  getAllServiceManagementFromDB,
  getSingleServiceManagementFromDB,
  updateServiceManagementIntoDB,
  deleteServiceManagementFromDB,
};

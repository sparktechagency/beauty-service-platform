import { Request, Response, NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubCategoryServices } from "./sub-category.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createSubCategory = catchAsync(async (req: Request, res: Response) => {
  const { ...subCategoryData } = req.body;
  const result = await SubCategoryServices.createSubCategoryIntoDB(
    subCategoryData
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "SubCategory created successfully",
    data: result,
  });
});

const getAllSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryServices.getAllSubCategoryFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "SubCategory retrieved successfully",
    data: result,
  });
});

//  ! it's for category to service call function
const getAllServiceFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubCategoryServices.getAServiceFromDB(id, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "SubCategory retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleSubCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubCategoryServices.getSingleSubCategoryFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "SubCategory retrieved successfully",
    data: result,
  });
});
const updateSubCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubCategoryServices.updateSubCategoryIntoDB(
    id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "SubCategory updated successfully",
    data: result,
  });
});
const deleteSubCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubCategoryServices.deleteSubCategoryFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "SubCategory deleted successfully",
    data: result,
  });
});

export const SubCategoryController = {
  createSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getAllServiceFromDB,
};

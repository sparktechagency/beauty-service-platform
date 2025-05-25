import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PredefiendReviewService } from "./predefind_review.service";
import sendResponse from "../../../shared/sendResponse";

const createPredefiendReview = catchAsync(async (req:Request, res:Response) => {
  const data = req.body;
  const result = await PredefiendReviewService.createPredefiendReview(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Predefiend Review created successfully",
    data: result,
  });
});
const deletePredefiendReview = catchAsync(async (req:Request, res:Response) => {
  const id = req.params.id;
  const result = await PredefiendReviewService.deletePredefiendReview(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Predefiend Review deleted successfully",
    data: result,
  });
});

const getAllPredefiendReview = catchAsync(async (req:Request, res:Response) => {
  const catagoryId = req.query.id as string;
  const result = await PredefiendReviewService.getAllPredefiendReview(catagoryId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Predefiend Review fetched successfully",
    data: result,
  });
});

export const PredefiendReviewController = {
  createPredefiendReview,
  deletePredefiendReview,
  getAllPredefiendReview,
};
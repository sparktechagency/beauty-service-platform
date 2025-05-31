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

const createGeneralReview = catchAsync(async (req:Request, res:Response) => {
  const data = req.body;
  const result = await PredefiendReviewService.createGeneralReview(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "General Review created successfully",
    data: result,
  });
});

const generalReview = catchAsync(async (req:Request, res:Response) => {
  const result = await PredefiendReviewService.getGeneralReviews();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "General Review fetched successfully",
    data: result,
  });
});

const adminReview = catchAsync(async (req:Request, res:Response) => {
  const query = req.query;
  const result = await PredefiendReviewService.getReviewsForAdmin(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "General Review fetched successfully",
    data: result.reviews,
    pagination: result.paginationInfo,
  });
});

export const PredefiendReviewController = {
  createPredefiendReview,
  deletePredefiendReview,
  getAllPredefiendReview,
  createGeneralReview,
  generalReview,
  adminReview,
};
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";


const createReview = catchAsync(async(req:Request, res:Response)=>{
    const result = await ReviewService.createReviewToDB(req.body);

    sendResponse(res, {
        statusCode : StatusCodes.OK,
        success: true,
        message: "Review Created Successfully",
        data: result
    })
})

const getAllReviews = catchAsync(async(req:Request, res:Response)=>{
    const result = await ReviewService.getAllReviews(req.query.service as string,req.query.artist as string,req.query);
    sendResponse(res, {
        statusCode : StatusCodes.OK,
        success: true,
        message: "Review Fetched Successfully",
        data: result.reviews,
        pagination: result.paginationInfo
    })
})

const getAllReviewsByOrder = catchAsync(async(req:Request, res:Response)=>{
    const result = await ReviewService.getAllReviewsByOrder(req.params.id);
    sendResponse(res, {
        statusCode : StatusCodes.OK,
        success: true,
        message: "Review Fetched Successfully",
        data: result
    })
})
export  const ReviewController = {createReview, getAllReviews,getAllReviewsByOrder}; 
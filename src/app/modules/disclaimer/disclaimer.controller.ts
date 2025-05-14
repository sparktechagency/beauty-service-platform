import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DisclaimerService } from "./disclaimer.service";
import sendResponse from "../../../shared/sendResponse";

const createDisclaimer = catchAsync(async (req:Request, res:Response) => {
  const { ...disclaimerData } = req.body;
  const result = await DisclaimerService.createDisclaimerToDb(disclaimerData)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Disclaimer created successfully",
    data: result,
  });
  });


const getAllDisclaimer = catchAsync(async (req:Request, res:Response) => {
  const result = await DisclaimerService.getAllDisclaimerFromDb(req.query.type as string)
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Disclaimer retrieved successfully",
    data: result,
  });
  });

  export const DisclaimerController = {
  createDisclaimer,
  getAllDisclaimer
};

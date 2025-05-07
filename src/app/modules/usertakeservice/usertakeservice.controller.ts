import { Request, Response, NextFunction } from "express";
import { UserTakeServiceServices } from "./usertakeservice.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createUserTakeService = catchAsync(
  async (req: Request, res: Response) => {
    const { ...userTakeServiceData } = req.body;

    const result = await UserTakeServiceServices.createUserTakeServiceIntoDB(
      userTakeServiceData,
      req.user as string
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "UserTakeService created successfully",
      data: result,
    });
  }
);

export const UserTakeServiceController = {
  createUserTakeService,
};

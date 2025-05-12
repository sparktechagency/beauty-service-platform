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

const getSingleService = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserTakeServiceServices.getSingleUserService(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "UserTakeService fetched successfully",
    data: result,
  });
});

const updateUserTakeService = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const { ...userTakeServiceData } = req.body;
    const result = await UserTakeServiceServices.updateUserTakeServiceIntoDB(
      id,
      userTakeServiceData,
      user!
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "UserTakeService updated successfully",
      data: result,
    });
  }
);

const getAllServiceForArtist = catchAsync(
  async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;
    const result = await UserTakeServiceServices.getAllServiceAsArtistFromDB(
      req.user!,
      latitude as number,
      longitude as number
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "UserTakeService fetched successfully",
      data: result,
    });
  }
);

export const UserTakeServiceController = {
  createUserTakeService,
  getSingleService,
  updateUserTakeService,
  getAllServiceForArtist
};

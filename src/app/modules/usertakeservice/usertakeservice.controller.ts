import { Request, Response, NextFunction } from "express";
import { UserTakeServiceServices } from "./usertakeservice.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";

const createUserTakeService = catchAsync(
  async (req: Request, res: Response) => {
    const { ...userTakeServiceData } = req.body;

    const result = await UserTakeServiceServices.createUserTakeServiceIntoDB(
      userTakeServiceData,
      req.user!
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
  const result = await UserTakeServiceServices.getSingleUserService(req.user,id);
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
    const { latitude, longitude,status } = req.body;
    const result = await UserTakeServiceServices.getAllServiceAsArtistFromDB(
      req.user!,
      latitude as number,
      longitude as number,
      status
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "UserTakeService fetched successfully",
      data: result,
    });
  }
);

const cancel_order = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {reason} = req.body;
  const result = await UserTakeServiceServices.cancelOrder(id,req.user!,reason);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "UserTakeService updated successfully",
    data: result,
  });
});


const payoutOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserTakeServiceServices.payoutOrderInDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "UserTakeService updated successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const user:any = req.user;
  const query = req.query;
  const userData = await User.findById(user.userId);

  const result = await UserTakeServiceServices.getAllBookingsFromDB(user!, query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "UserTakeService fetched successfully",
    data: result.data,
    pagination: result.paginationInfo
  });
});

const getOverview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserTakeServiceServices.paymentOverview();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "UserTakeService fetched successfully",
    data: result,
  });
});

const confirmOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await UserTakeServiceServices.confirmOrderToDB(id as any, user!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "UserTakeService updated successfully",
    data: result,
  });
});

export const UserTakeServiceController = {
  createUserTakeService,
  getSingleService,
  updateUserTakeService,
  getAllServiceForArtist,
  cancel_order,
  payoutOrder,
  getAllBookings,
  getOverview,
  confirmOrder,
};

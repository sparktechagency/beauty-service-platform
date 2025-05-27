import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

// register user
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);
  
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        "Your account has been successfully created. Verify Your Email By OTP. Check your email",
    });
  }
);

// retrieved user profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user: any = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile data retrieved successfully",
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    
    const result = await UserService.updateProfileToDB(user!, req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Profile updated successfully",
      data: result,
    });
  }
);

const createStripeAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await UserService.createStripeAccoutToDB(user!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Stripe account created successfully",
      data: result,
    });
  }
);

const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserService.getUsersFromDB(query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Users retrieved successfully",
      data: result.users,
      pagination: result.pagination,
    });
  }
);

const deleteAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {password} = req.body;
    const result = await UserService.deleteAccount(user!,password);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Account deleted successfully",
      data: result,
    });
  }
);

const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const query = req.query;
    const result = await UserService.getUserDataUsingIdFromDB(id,query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  }
);

const updateUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserService.updateUserDataById(id, req.body);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User updated successfully",
      data: result,
    });
  }
);

const addCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserService.addCategoriesToUserInDB(id, req.body.categories);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Categories added successfully",
      data: result,
    });
  }
);

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  createStripeAccount,
  getUsers,
  deleteAccount,
  getUserById,
  updateUserById,
  addCategories,
};

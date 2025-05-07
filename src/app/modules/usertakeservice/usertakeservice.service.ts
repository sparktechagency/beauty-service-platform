import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IUserTakeService } from "./usertakeservice.interface";
import { UserTakeService } from "./usertakeservice.model";
import { Types } from "mongoose";

const createUserTakeServiceIntoDB = async (
  payload: IUserTakeService,
  userId: string
) => {
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }
  const data = {
    ...payload,
    userId: new Types.ObjectId(userId),
  };

  const result = await UserTakeService.create(data);

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create UserTakeService"
    );
  }

  return result;
};

export const UserTakeServiceServices = {
  createUserTakeServiceIntoDB,
};

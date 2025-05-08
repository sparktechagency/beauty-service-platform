import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IUserTakeService } from "./usertakeservice.interface";
import { UserTakeService } from "./usertakeservice.model";
import { Types } from "mongoose";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { calculateDistanceInKm } from "../../../util/calculateDistanceInKm ";
import { JwtPayload } from "jsonwebtoken";

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

  const allProviders = await User.find({
    role: USER_ROLES.ARTIST,
    isActive: true,
  });
  // 📍 Filter by 5km radius
  const nearbyProviders = allProviders.filter((provider) => {
    if (provider.latitude && provider.longitude) {
      const distance = calculateDistanceInKm(
        payload.latitude,
        payload.longitude,
        provider.latitude,
        Number(provider.longitude)
      );
      return distance <= 50;
    }
    return false;
  });
  for (const provider of nearbyProviders) {
    await sendNotifications({
      receiver: provider._id,
      title: "New service request near you",
      message: "A new service request has been created near you",
      type: "service-request",
      filePath: "request",
      serviceId: result._id,
      // @ts-ignore
      userId: userId.id,
      data: payload,
    });
  }
  return result;
};

const getSingleUserService = async (
  id: string
): Promise<IUserTakeService | null> => {
  const result = await UserTakeService.findById(id).populate("serviceId");
  // TODO: order details provider details
  // const userLatitude = result?.latitude;
  // const userLongitude = result?.longitude;
  // const providers = await User.find({ role: USER_ROLES.ARTIST });
  // const nearbyProviders = providers.filter((provider) => {
  //   if (provider.latitude && provider.longitude) {
  //     const distance = calculateDistanceInKm(
  //       userLatitude as number,
  //       userLongitude as number,
  //       provider.latitude,
  //       Number(provider.longitude)
  //     );
  //     return distance <= 50;
  //   }
  //   return false;
  // });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }
  return result;
};

const updateUserTakeServiceIntoDB = async (
  id: string,
  payload: Partial<IUserTakeService>,
  user: JwtPayload
): Promise<IUserTakeService | null> => {
  const isExist = await UserTakeService.findOne({ _id: id });
  if (isExist?.isBooked === true) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service already booked !");
  }
  payload.artiestId = user.id as any;
  const result = await UserTakeService.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "UserTakeService not found!");
  }
  const findUser = await User.findById(user.id);
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  await sendNotifications({
    receiver: isExist?.userId,
    title: `${findUser?.name} Accept your order`,
    message: "Accepted your service request",
    type: "service-request",
    filePath: "request",
    serviceId: result._id,
    data: payload,
  });
  return result;
};

// TODO: Need to create another api for isActive or not a Artist

export const UserTakeServiceServices = {
  createUserTakeServiceIntoDB,
  getSingleUserService,
  updateUserTakeServiceIntoDB,
};

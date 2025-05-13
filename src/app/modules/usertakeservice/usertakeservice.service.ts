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
import { number } from "zod";
import { locationHelper } from "../../../helpers/locationHelper";
import stripe from "../../../config/stripe";
import { ServiceManagement } from "../servicemanagement/servicemanagement.model";
import { Subscription } from "../subscription/subscription.model";
import { Plan } from "../plan/plan.model";

const createUserTakeServiceIntoDB = async (
  payload: IUserTakeService,
  userId: JwtPayload
) => {
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const userData = await User.findById(userId.id);
  
  const data = {
    ...payload,
    userId: new Types.ObjectId(userId.id),
  };

  const subscription = await Subscription.findOne({
    user: userId.id,
    status: "active",
  });

  let fee = 0;
  if (!subscription || subscription.price === 0) {
    fee = 10
  }

  if(subscription){
  const plan = await Plan.findOne({
    _id: subscription?.package,
  });

 if(plan?.name.toLowerCase().includes('glow')){
  fee=5
 }
 else if(plan?.name.toLowerCase().includes('luxe')){
  fee=0
 }
}
payload.app_fee =payload.price*(fee/100)
payload.total_amount = payload.price + payload.app_fee;

  const service = await ServiceManagement.findById(payload.serviceId);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: service?.name||"demo",
          },
          unit_amount: payload.total_amount* 100,
        },
        quantity: 1,
      },
    ],
    customer_email:userData?.email,
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `https://www.your.com/user/payment-success`,
    cancel_url: `https://www.your.com/user/payment-cancel`,
    metadata:{
      data:JSON.stringify({...payload,userId:userId.id})
    }
  });


return session.url
};

export const nearByOrderByLatitudeAndLongitude = async (
  latitude: number,
  longitude: number
) => {
  const result = await UserTakeService.find({
    status: "pending",
    isBooked: false,
  });
  const filterData = result.filter((services) => {
    if (services.latitude && services.longitude) {
      const distance = calculateDistanceInKm(
        latitude,
        longitude,
        services.latitude,
        Number(services.longitude)
      );
      return distance <= 50;
    }
    return false;
  });

  return filterData;

}

const getAllServiceAsArtistFromDB = async (
  user: JwtPayload,
  latitude: number,
  longitude: number
) => {

  const filterData = await nearByOrderByLatitudeAndLongitude(latitude, longitude);
  locationHelper({ receiver: user.id, data: filterData });
  // Check if user data needs to be updated
  const existingUser = await User.findById(user.id);
  
  if (
    existingUser?.latitude !== latitude ||
    existingUser?.longitude !== longitude ||
    !existingUser?.isActive
  ) {
    const userData = await User.findByIdAndUpdate(
      user.id,
      { $set: { latitude, longitude,isActive: true } },
      { new: true }
    );
    console.log("User location updated:", userData);
  }

  return filterData;
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

  const allProviders = await User.find({
    role: USER_ROLES.ARTIST,
    isActive: true,
  });
  // // 📍 Filter by 5km radius
  const nearbyProviders = allProviders.filter((provider) => {
    if (provider.latitude && provider.longitude) {
      const distance = calculateDistanceInKm(
        result.latitude,
        result.longitude,
        provider.latitude,
        Number(provider.longitude)
      );
      console.log(distance);
      
      return distance <= 50;
    }
  })

  
    const nearbyOrders = await nearByOrderByLatitudeAndLongitude(result.latitude, result.longitude);

    
    for(const provider of nearbyProviders){
      locationHelper({ receiver: provider._id, data: nearbyOrders });
    }


  return result;
};

const bookOrder = async (payload:IUserTakeService)=>{
  const result = await UserTakeService.create(payload);
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
  // // 📍 Filter by 5km radius
  const nearbyProviders = allProviders.filter((provider) => {
    if (provider.latitude && provider.longitude) {
      const distance = calculateDistanceInKm(
        payload.latitude,
        payload.longitude,
        provider.latitude,
        Number(provider.longitude)
      );
      console.log(distance);
      
      return distance <= 50;
    }
  })

  
    for (const provider of nearbyProviders) {
      await sendNotifications({
        receiver: provider._id,
        title: "New service request near you",
        message: "A new service request has been created near you",
        type: "service-request",
        filePath: "request",
        serviceId: result._id,
        // @ts-ignore
        userId: payload.userId,
        data: payload,
      });
    }
    const nearbyOrders = await nearByOrderByLatitudeAndLongitude(payload.latitude, payload.longitude);

    
    for(const provider of nearbyProviders){
      locationHelper({ receiver: provider._id, data: nearbyOrders });
    }
    return result;
}

// cacel order

const cancelOrder = async (orderId:string,user:JwtPayload)=>{
  const order = await UserTakeService.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if(['completed','cancelled'].includes(order.status)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is not cancellable");
  }

  if(order.userId.toString() !== user.id){
    throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to cancel this order");
  }
  const temp:any = order;
  const orderTime = new Date(temp.createdAt);
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - orderTime.getTime();
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  let cost = 0;
  if(hoursDifference<=24){
    cost = 0
  }
  


}

export const UserTakeServiceServices = {
  createUserTakeServiceIntoDB,
  getSingleUserService,
  updateUserTakeServiceIntoDB,
  // * for artist all services in map
  getAllServiceAsArtistFromDB,
  bookOrder
};

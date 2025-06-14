import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IUserTakeService } from "./usertakeservice.interface";
import { UserTakeService } from "./usertakeservice.model";
import { ObjectId, Query, Types } from "mongoose";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { calculateDistanceInKm } from "../../../util/calculateDistanceInKm ";
import { JwtPayload } from "jsonwebtoken";
import { number } from "zod";
import {
  locationHelper,
  locationRemover,
} from "../../../helpers/locationHelper";
import stripe from "../../../config/stripe";
import { ServiceManagement } from "../servicemanagement/servicemanagement.model";
import { Subscription } from "../subscription/subscription.model";
import { Plan } from "../plan/plan.model";
import { Wallet } from "../wallet/wallet.model";
import QueryBuilder from "../../builder/queryBuilder";
import { populate } from "dotenv";
import { Review } from "../review/review.model";
import { WalletService } from "../wallet/wallet.service";
import { Reward } from "../reward/reward.model";
import { logger } from "../../../shared/logger";
import { sendNotificationToFCM } from "../../../helpers/firebaseNotificationHelper";
import cryptoToken from "../../../util/cryptoToken";
import axios from "axios";
import config from "../../../config";
import { BonusAndChallengeServices } from "../bonusAndChallenge/bonusAndChallenge.service";
import { BONUS_TYPE } from "../bonusAndChallenge/bonusAndChallenge.interface";
import { BonusAndChallenge } from "../bonusAndChallenge/bonusAndChallenge.model";
import { INotification } from "../notification/notification.interface";

const createUserTakeServiceIntoDB = async (
  payload: IUserTakeService,
  userId: JwtPayload
) => {
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  const userData = await User.findById(userId.id);
  const service = await ServiceManagement.findById(payload.serviceId);
  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }
  if (service.status == "paused") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service is paused");
  }

  const data = {
    ...payload,
    userId: new Types.ObjectId(userId.id),
  };

  const encodedAddress = encodeURIComponent(payload.address);

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${config.gooogle.mapKey}`
  );
  console.log(response.data);
  
  const location = response.data.results[0]?.geometry?.location;

  

  if (!location) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid address");
  }

  data.latitude = location.lat;
  data.longitude = location.lng;

  const serviceDate = new Date(
    `${payload.date}T${payload.time}:00Z`
  ).toISOString();

  data.service_date = serviceDate as any;

  const result = await UserTakeService.create(data);
  const allProviders = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.ARTIST,
        isActive: true,
        categories: { $in: [service._id] },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscription",
        foreignField: "_id",
        as: "subscription",
      },
    },
    {
      $unwind: "$subscription",
    },
    {
      $lookup: {
        from: "plans",
        localField: "subscription.package",
        foreignField: "_id",
        as: "subscription.package",
      },
    },
    {
      $unwind: "$subscription.package",
    },
    {
      $sort: { "subscription.package.price": -1 },
    },
  ]);
  const currentDate = new Date();
  //  📍 Filter by 5km radius
  const nearbyProviders = allProviders.filter((provider) => {
    if (provider.latitude && provider.longitude) {
      const distance = calculateDistanceInKm(
        result.latitude,
        result.longitude,
        provider.latitude,
        Number(provider.longitude)
      );

      return distance <= 70;
    }
  }).filter((provider) =>{
    
    
    if(!provider.last_accept_date){
      return true
    }
    const lastAcceptDate = new Date(provider.last_accept_date);
    const timeDifference = currentDate.getTime() - lastAcceptDate.getTime();
    const minutesDifference = timeDifference / (1000 * 60);
    const hoursDifference = minutesDifference / 60;
    
    
    return hoursDifference > 4;
  });

  for (const provider of nearbyProviders) {
    const notificationPayload = {
      title: `Someone request for ${service.name}`,
      message: "A new service request has been created near you",
      filePath: "request",
      serviceId: result._id,
      userId: provider._id,
      isRead: false,
    }
 if(provider.deviceToken){
     await sendNotificationToFCM({
      body: `Someone request for ${service.name}`,
      title: "New Service Request",
      token: provider.deviceToken,
      data:
        {
          ...notificationPayload,
        }
      
    });
 }
    await sendNotifications(
      {
      receiver: [provider._id],
      title: `Someone request for ${service.name}`,
      message: "A new service request has been created near you",
      filePath: "request",
      serviceId: result._id,
      userId: provider._id,
      isRead: false,
    }
    );
    if(userData?.deviceToken){
      await sendNotificationToFCM({
        body: `Someone request for ${service.name}`,
        title: "New Service Request",
        token: userData.deviceToken,
        data:notificationPayload
          
        
      });
    }
  }

  
  

  const currentOrder = await UserTakeService.findById(result._id).populate([
    {
      path: "serviceId",
      select: ["name", "category", "subCategory"],
      populate: [
        {
          path: "category",
          select: ["name"],
        },
      ],
    },
    {
      path: "userId",
      select: [
        "name",
        "email",
        "phone",
        "profile",
        "isActive",
        "status",
        "subscription",
        "location",
      ],
      populate: [
        {
          path: "subscription",
          select: ["package", "status"],
          populate: [
            {
              path: "package",
              select: ["name", "price", "price_offer"],
            },
          ],
        },
      ],
    },
    {
      path: "artiestId",
      select: [
        "name",
        "email",
        "phone",
        "profile",
        "isActive",
        "status",
        "subscription",
        "location",
      ],
      populate: [
        {
          path: "subscription",
          select: ["package", "status"],
          populate: [
            {
              path: "package",
              select: ["name", "price", "price_offer"],
            },
          ],
        },
      ],
    },
  ]);

  for (const provider of nearbyProviders) {
    locationHelper({ receiver: provider._id, data: currentOrder! });
  }

  return result;
};

const confirmOrderToDB = async (orderId: ObjectId, userId: JwtPayload) => {
  const order = await UserTakeService.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  if (order.payment_intent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order already confirmed");
  }
  const subscription = await Subscription.findOne({
    user: userId.id,
    status: "active",
  }).populate("package");

  const plan: any = subscription?.package;

  let fee = plan?.price_offer || 10;
  order!.app_fee = order.price * (fee / 100);
  order.total_amount = order.price + order.app_fee;

  const service = await ServiceManagement.findById(order.serviceId);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: service?.name || "demo",
          },
          unit_amount: order.total_amount * 100,
        },
        quantity: 1,
      },
    ],
    
    customer_email: userId?.email,
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `https://www.your.com/user/payment-success`,
    cancel_url: `https://www.your.com/user/payment-cancel`,
    metadata: {
      data: JSON.stringify({
        orderId,
        app_fee: order.app_fee,
        total_amount: order.total_amount,
      }),
    },

  });

  const user = await User.findById(userId.id);
  const notificationPayload = {
    title: `Your order has been confirmed`,
    message: "Your order has been confirmed",
    filePath: "request",
    orderId,
    userId: userId.id,
    isRead: false,
  }
  if(user?.deviceToken){
    await sendNotificationToFCM({
      body: `Your order has been confirmed`,
      title: "Order Confirmed",
      token: user.deviceToken,
      data:notificationPayload
    });
  }
  const artist = await User.findById(order.artiestId);
  if(artist?.deviceToken){
    await sendNotificationToFCM({
      body: `${user?.name} has confirmed her order`,
      title: "Order Confirmed",
      token: artist.deviceToken,
      data:notificationPayload
    })
  }

  return session.url;

}

export const nearByOrderByLatitudeAndLongitude = async (
  latitude: number,
  longitude: number
) => {
  const currentTime = new Date();
  const fifteenMinutesBefore = new Date(currentTime.getTime() - 15 * 60 * 1000);

  const result = await UserTakeService.find({
    status: "pending",
    isBooked: false,
    createdAt: {
      $gte: fifteenMinutesBefore,
      $lte: currentTime,
    },
  })
    .populate([
      {
        path: "serviceId",
        select: ["name", "category", "subCategory"],
        populate: [
          {
            path: "category",
            select: ["name"],
          },
        ],
      },
      {
        path: "userId",
        select: [
          "name",
          "email",
          "phone",
          "profile",
          "isActive",
          "status",
          "subscription",
          "location",
        ],
        populate: [
          {
            path: "subscription",
            select: ["package", "status"],
            populate: [
              {
                path: "package",
                select: ["name", "price", "price_offer"],
              },
            ],
          },
        ],
      },
      {
        path: "artiestId",
        select: [
          "name",
          "email",
          "phone",
          "profile",
          "isActive",
          "status",
          "subscription",
          "location",
        ],
        populate: [
          {
            path: "subscription",
            select: ["package", "status"],
            populate: [
              {
                path: "package",
                select: ["name", "price", "price_offer"],
              },
            ],
          },
        ],
      },
    ])
    .sort({ createdAt: -1 })
    .lean();
    
    

  const filterData = result.filter((services) => {
    if (services.latitude && services.longitude) {
      const distance = calculateDistanceInKm(
        latitude,
        longitude,
        services.latitude,
        Number(services.longitude)
      );

      

      return distance <= 70;
    }
    return false;
  });


  return filterData;
};

const getAllServiceAsArtistFromDB = async (
  user: JwtPayload,
  latitude: number,
  longitude: number,
  status: boolean
) => {
  if (status==true) {
    const filterData = await nearByOrderByLatitudeAndLongitude(
      latitude,
      longitude
    );


    

    filterData.forEach((item) => {
      locationHelper({ receiver: user.id, data: item });
    });
  } else {
    locationHelper({ receiver: user.id, data: {} as any });
  }

  // Check if user data needs to be updated
  const existingUser = await User.findById(user.id);

  const userData = await User.findByIdAndUpdate(
    user.id,
    { $set: { latitude, longitude, isActive: status } },
    { new: true }
  );
  return userData;
};

const getSingleUserService = async (
  id: string
): Promise<IUserTakeService | null> => {
  const result = await UserTakeService.findById(id).populate([
    {
      path: "serviceId",
      select: ["name", "category", "subCategory", "image", "addOns"],
      populate: [
        {
          path: "category",
          select: ["name"],
        },
        {
          path: "subCategory",
          select: ["name"],
        },
      ],
    },
    {
      path: "userId",
      select: [
        "name",
        "email",
        "phone",
        "profile",
        "isActive",
        "status",
        "subscription",
        "location",
      ],
      populate: [
        {
          path: "subscription",
          select: ["package", "status"],
          populate: [
            {
              path: "package",
              select: ["name", "price", "price_offer"],
            },
          ],
        },
      ],
    },
    {
      path: "artiestId",
      select: [
        "name",
        "email",
        "phone",
        "profile",
        "isActive",
        "status",
        "subscription",
        "location",
      ],
      populate: [
        {
          path: "subscription",
          select: ["package", "status"],
          populate: [
            {
              path: "package",
              select: ["name", "price", "price_offer"],
            },
          ],
        },
      ],
    },
  ]);

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }
  return result;
};

const updateUserTakeServiceIntoDB = async (
  id: string,
  user: JwtPayload
): Promise<IUserTakeService | null> => {
  const isExist = await UserTakeService.findOne({ _id: id });
  if (isExist?.isBooked === true) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service already booked !");
  }
  const userData = await User.findById(user.id);
  const currentDate = new Date();
  if(userData?.last_accept_date){
    const last_accept_date = new Date(userData?.last_accept_date);
    const diff = currentDate.getTime() - last_accept_date.getTime();
    const diffInMinutes = Math.floor(diff / (1000 * 60));
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    if (diffInHours<4) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You can't accept this service within 4 hours of the last accepted service."
      );
    }
  }
  if (userData?.status == "deleted") {
    throw new ApiError(StatusCodes.FORBIDDEN, "you account is inactive");
  }

  const result: any = await UserTakeService.findOneAndUpdate(
    { _id: id },
    { artiestId: user.id, artist_book_date: new Date(), isBooked: true },
    { new: true }
  ).populate("serviceId");

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "UserTakeService not found!");
  }
  const findUser = await User.findById(user.id);
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  const customer = await User.findById(isExist?.userId);
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found!");
  }
  if (customer?.deviceToken) {
    const notificationPayload:INotification = {
      title: `${findUser?.name} Accept your order`,
      message: `Your request for ${result?.serviceId?.name} has been accepted by ${findUser?.name}`,
      filePath:"booking",
      isRead: false,
      userId: customer?._id,

    }
    await sendNotificationToFCM({
      body: `Your request for ${result?.serviceId?.name} has been accepted by ${findUser?.name}`,
      title: `${findUser?.name} Accept your order`,
      token: customer?.deviceToken,
      data: notificationPayload,
    });
  }

  await sendNotifications({
    receiver: [isExist?.userId!],
    title: `${findUser?.name} Accept your order`,
    message: "Accepted your service request",
    filePath: "booking",
    serviceId: result._id,
    isRead: false,
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

      return distance <= 50;
    }
  });

  for (const provider of nearbyProviders) {
    locationRemover({ receiver: provider._id, data: id });
  }

  return result;
};

// its after stripe payment
const bookOrder = async (
  payload: ObjectId,
  payment_intent: string,
  app_fee: number,
  total_amount: number
) => {
  try {
    const result = await UserTakeService.findOne({ _id: payload });

    if (!result) {
      console.log("result not found");
      return
    }

    const updateOrder = await UserTakeService.findOneAndUpdate(
      { _id: payload },
      {
        app_fee,
        total_amount,
        status: "inProgress",
        payment_intent: payment_intent,
      },
      { new: true }
    );

    return updateOrder;
  } catch (error) {
    logger.error(error);
  }
};

// cacel order

const cancelOrder = async (
  orderId: string,
  user: JwtPayload,
  resion?: string
) => {
  const order = await UserTakeService.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if (["completed", "cancelled"].includes(order.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is not cancellable");
  }

  if (user.role == USER_ROLES.ARTIST) {
    const orderTime = new Date(order.artist_book_date!);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - orderTime.getTime();
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const hoursDifference = Math.floor(minutesDifference / 60);
    let status = "low";
    if (hoursDifference < 24) {
      status = "high";
    }
    if (order.payment_intent) {
      await stripe.refunds.create({
        payment_intent: order.payment_intent,
        amount: order.price,
      });
    }
    await UserTakeService.updateOne(
      { _id: orderId },
      {
        status: "cancelled",
        cancelled_by: "artist",
        cancelled_reason: resion,
        cancel_status: status,
      }
    );
    const high_order = await UserTakeService.countDocuments({
      cancel_status: "high",
      providerId: user.id,
    });
    if (high_order >= 5) {
      await User.findOneAndUpdate(
        { _id: user.id },
        { isActive: false, status: "inactive" }
      );
    }

    return {
      message: "Order cancelled and refunded successfully",
    };
  }

  const temp: any = order;
  if (!order.artist_book_date) {
 if(order.payment_intent){
     await stripe.refunds.create({
      payment_intent: order.payment_intent,
      amount: order.price,
    });
 }
    await UserTakeService.updateOne({ _id: orderId }, { status: "cancelled" });
    return {
      message: "Order cancelled and refunded successfully with 0% cost",
    };
  }
  const orderTime = new Date(temp.createdAt);
  const currentTime = new Date(temp.artist_book_date);
  const timeDifference = currentTime.getTime() - orderTime.getTime();
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  let cost = 0;
  if (hoursDifference > 24) {
    cost = 0;
  } else if (hoursDifference > 4 && hoursDifference <= 24) {
    cost = 25;
  } else if (hoursDifference > 0 && hoursDifference <= 4) {
    cost = 50;
  } else {
    cost = 50;
  }

  if (order.payment_intent) {
    const refund_amount = order.price! - order.price! * (cost / 100);
    await stripe.refunds.create({
      payment_intent: order.payment_intent,
      amount: refund_amount,
    });
  }
  await UserTakeService.updateOne(
    { _id: orderId },
    { status: "cancelled", cancelled_by: "user", cancelled_reason: resion }
  );

  return {
    message: "Order cancelled and refunded successfully",
  };
};

const payoutOrderInDB = async (orderId: string) => {
  const order = await UserTakeService.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if (["completed", "cancelled"].includes(order.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is not completable");
  }

  const subscription = await Subscription.findOne({
    user: order.artiestId,
    status: "active",
  }).populate("package");

  const basicPackage = await Plan.findOne({
    name: "Ah Basic",
    for: USER_ROLES.ARTIST,
  });

  const packageData: any = subscription?.package;
  const cost = packageData?.price_offer ?? basicPackage?.price_offer ?? 8;

  const amount = order.price - (order.price * cost) / 100;

  await Wallet.findOneAndUpdate(
    { user: order.artiestId },
    { $inc: { balance: amount } }
  );
  const txtId = "TXN" + cryptoToken(6);
  await UserTakeService.updateOne(
    { _id: orderId },
    {
      status: "completed",
      artist_app_fee: (order.price * cost) / 100 || 0,
      trxId: txtId,
    }
  );

  //Bonus section after the completion of the order
  const clienBookings = await UserTakeService.countDocuments({
    userId: order.userId,
    status: "completed",
  });
  if (clienBookings == 1) {
    await WalletService.updateWallet(order.userId, 5);
    await Reward.create({
      user: order.userId,
      occation: "UserTakeService",
      amount: 5,
      occationId: order._id,
      title: "completed first booking",
    });
  }
  if (clienBookings == 5) {
    await WalletService.updateWallet(order.userId, 5);
    await Reward.create({
      user: order.userId,
      occation: "UserTakeService",
      amount: 5,
      occationId: order._id,
      title: `completed 5 bookings`,
    });
  }

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const monthlyBookings = await UserTakeService.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    status: "completed",
    userId: order.userId,
  });

  if (monthlyBookings == 3) {
    await WalletService.updateWallet(order.userId, 10);
    await Reward.create({
      user: order.userId,
      occation: "UserTakeService",
      amount: 10,
      occationId: order._id,
    });
    await Reward.create({
      user: order.userId,
      occation: "UserTakeService",
      amount: 10,
      occationId: order._id,
      title: `completed ${monthlyBookings} bookings in the month`,
    });
  }

  const artistBookings = await UserTakeService.countDocuments({
    status: "completed",
    artiestId: order.artiestId,
  });
  if (artistBookings == 10) {
    await WalletService.updateWallet(order.artiestId!, 10);
    await Reward.create({
      user: order.artiestId!,
      occation: "UserTakeService",
      amount: 10,
      occationId: order._id,
      title: `completed ${monthlyBookings} bookings`,
    });
  }

  const currentBonus = await BonusAndChallengeServices.currentBonusForUser(
    order.artiestId!,
    BONUS_TYPE.BOOKING
  );
  if (currentBonus) {
    const bookings = await UserTakeService.countDocuments({
      status: "completed",
      artiestId: order.artiestId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (bookings == currentBonus.amount) {
      await WalletService.updateWallet(order.artiestId!, currentBonus.amount);
      await Reward.create({
        user: order.artiestId!,
        occation: "UserTakeService",
        amount: currentBonus.amount,
        occationId: order._id,
        title: `completed ${monthlyBookings}`,
      });
      await BonusAndChallenge.findOneAndUpdate(
        { _id: order.artiestId },
        { $push: { tekenUsers: order.artiestId } }
      );
      const artist3 = await User.findById(order.artiestId);
      if (artist3?.deviceToken) {
        await sendNotificationToFCM({
          token: artist3?.deviceToken,
          title: "Congratulations",
          body: `You have completed ${bookings} bookings in the month.`,
          data: {
            type: "booking",
            bookingId: order._id,
          },
        });
      }
    }

    const userCurrentBonus =
      await BonusAndChallengeServices.currentBonusForUser(
        order.userId,
        BONUS_TYPE.BOOKING
      );
    if (userCurrentBonus) {
      await WalletService.updateWallet(order.userId!, userCurrentBonus.amount);
      await Reward.create({
        user: order.userId!,
        occation: "UserTakeService",
        amount: userCurrentBonus.amount,
        occationId: order._id,
        title: `completed ${monthlyBookings}`,
      });
      await BonusAndChallenge.findOneAndUpdate(
        { _id: order.userId },
        { $push: { tekenUsers: order.userId } }
      );
      const user3 = await User.findById(order.userId);
      if (user3?.deviceToken) {
        await sendNotificationToFCM({
          token: user3?.deviceToken,
          title: "Congratulations",
          body: `You have completed ${bookings} bookings in the month.`,
          data: {
            type: "booking",
            bookingId: order._id,
          },
        });
      }
    }
  }

  const customer = await User.findById(order.userId);
  const artist = await User.findById(order.artiestId);

  if (artist?.deviceToken) {
    await sendNotificationToFCM({
      title: `${customer?.name} has completed the booking`,
      body: `${customer?.name} has completed the booking`,
      data: {
        type: "booking_completed",
        bookingId: order._id,
      },
      token: artist?.deviceToken,
    });
  }

  return {
    message: "Order completed and payout successfully",
  };
};

const getAllBookingsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const result = new QueryBuilder(
    UserTakeService.find(
      [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)
        ? {}
        : {
            $or: [
              {
                userId: user.id,
              },
              {
                artiestId: user.id,
              },
            ],
          }
    ),
    query
  )
    .sort()
    .filter()
    .paginate();
  const paginationInfo = await result.getPaginationInfo();

  const data = await result.modelQuery
    .populate([
      {
        path: "serviceId",
        select: ["name", "category", "subCategory", "image"],
        populate: [
          {
            path: "category",
            select: ["name"],
          },
        ],
      },
      {
        path: "userId",
        select: [
          "name",
          "email",
          "phone",
          "profile",
          "isActive",
          "status",
          "subscription",
          "location",
        ],
        populate: [
          {
            path: "subscription",
            select: ["package", "status"],
            populate: [
              {
                path: "package",
                select: ["name", "price", "price_offer"],
              },
            ],
          },
        ],
      },
      {
        path: "artiestId",
        select: [
          "name",
          "email",
          "phone",
          "profile",
          "isActive",
          "status",
          "subscription",
          "location",
        ],
        populate: [
          {
            path: "subscription",
            select: ["package", "status"],
            populate: [
              {
                path: "package",
                select: ["name", "price", "price_offer"],
              },
            ],
          },
        ],
      },
    ])
    .lean()
    .exec();

  return {
    paginationInfo,
    data,
  };
};

const paymentOverview = async () => {
  const today = new Date().toISOString().slice(0, 10);
  let totalErning = 0;
  let totalErningToday = 0;

  let totalCommission = 0;
  let totalCommissionToday = 0;

  let totalTips = 0;
  let totalTipsToday = 0;

  const orders = await UserTakeService.find({}).lean();

  orders.forEach((order: any) => {
    if (order.status != "cancelled") {
      totalErning += order.price;
      if (order.createdAt.toISOString().slice(0, 10) == today) {
        totalErningToday += order.price;
      }
    }
    totalCommission += order.app_fee || 0;
    if (order.createdAt.toISOString().slice(0, 10) == today) {
      totalCommissionToday += order.app_fee || 0;
    }
  });

  const tips = await Review.find({}).lean();
  tips.forEach((tip: any) => {
    totalTips += tip.tip || 0;
    if (tip.createdAt.toISOString().slice(0, 10) == today) {
      totalTipsToday += tip.tip || 0;
    }
  });
  return {
    earning: {
      total: totalErning,
      today: totalErningToday,
    },
    commission: {
      total: totalCommission,
      today: totalCommissionToday,
    },
    tips: {
      total: totalTips,
      today: totalTipsToday,
    },
  };
};

const reminderToUsers = async () => {
  const today = new Date();
  const tommorow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const orders = await UserTakeService.find({
    $or: [{ status: "pending" }, { status: "inProgress" }],
    service_date: {
      $gte: today,
      $lte: tommorow,
    },
  });

  for (const order of orders) {
    const customer = await User.findById(order.userId);
    const artist = await User.findById(order.artiestId);
    if (customer?.deviceToken) {
      await sendNotificationToFCM({
        title: `Reminder for your booking`,
        body: `${customer?.name} has booked a service from you`,
        data: {
          type: "booking_reminder",
          bookingId: order._id,
        },
        token: customer?.deviceToken,
      });
    }

    if (artist?.deviceToken) {
      await sendNotificationToFCM({
        title: `Reminder for your booking`,
        body: `${customer?.name} has booked a service from you`,
        data: {
          type: "booking_reminder",
          bookingId: order._id,
        },
        token: artist?.deviceToken!,
      });
    }
  }
};


/// expand Area 

const expandAreaForOrder = async (order_id:Types.ObjectId,area:number)=>{
  const result = await UserTakeService.findById(order_id);
  if(!result) return
  const service = await ServiceManagement.findById(result?.serviceId);
  const currentDate = new Date();
  const allProviders = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.ARTIST,
        isActive: true,
        categories: { $in: [service?._id] },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscription",
        foreignField: "_id",
        as: "subscription",
      },
    },
    {
      $unwind: "$subscription",
    },
    {
      $lookup: {
        from: "plans",
        localField: "subscription.package",
        foreignField: "_id",
        as: "subscription.package",
      },
    },
    {
      $unwind: "$subscription.package",
    },
    {
      $sort: { "subscription.package.price": -1 },
    },
  ]);

  //  📍 Filter by 5km radius
  const nearbyProviders = allProviders.filter((provider) => {
    if (provider.latitude && provider.longitude) {
      const distance = calculateDistanceInKm(
        result.latitude,
        result.longitude,
        provider.latitude,
        Number(provider.longitude)
      );

      return distance <= (area||50);
    }
  }).filter((provider) =>{
    if(!provider.last_accept_date){
      return true
    }
    const lastAcceptDate = new Date(provider.last_accept_date);
    const timeDifference = currentDate.getTime() - lastAcceptDate.getTime();
    const minutesDifference = timeDifference / (1000 * 60);
    const hoursDifference = minutesDifference / 60;
    
    
    return hoursDifference > 4;
  });

  for (const provider of nearbyProviders) {
    if(provider.deviceToken){
         await sendNotificationToFCM({
      body: `Someone request for ${service?.name}`,
      title: "New Service Request",
      token: provider.deviceToken,

    });
    }
    await sendNotifications({
      receiver: [provider._id],
      title: `Someone request for ${service?.name}`,
      message: "A new service request has been created near you",
      filePath: "request",
      serviceId: result._id,
      userId: result.userId,
      isRead: false,
    });
  }

  const currentOrder = await UserTakeService.findById(result._id).populate([
    {
      path: "serviceId",
      select: ["name", "category", "subCategory"],
      populate: [
        {
          path: "category",
          select: ["name"],
        },
      ],
    },
    {
      path: "userId",
      select: [
        "name",
        "email",
        "phone",
        "profile",
        "isActive",
        "status",
        "subscription",
        "location",
      ],
      populate: [
        {
          path: "subscription",
          select: ["package", "status"],
          populate: [
            {
              path: "package",
              select: ["name", "price", "price_offer"],
            },
          ],
        },
      ],
    },
    {
      path: "artiestId",
      select: [
        "name",
        "email",
        "phone",
        "profile",
        "isActive",
        "status",
        "subscription",
        "location",
      ],
      populate: [
        {
          path: "subscription",
          select: ["package", "status"],
          populate: [
            {
              path: "package",
              select: ["name", "price", "price_offer"],
            },
          ],
        },
      ],
    },
  ]);

  for (const provider of nearbyProviders) {
    locationHelper({ receiver: provider._id, data: currentOrder! });
  }


}

export const UserTakeServiceServices = {
  createUserTakeServiceIntoDB,
  getSingleUserService,
  updateUserTakeServiceIntoDB,
  // * for artist all services in map
  getAllServiceAsArtistFromDB,
  bookOrder,
  cancelOrder,
  payoutOrderInDB,
  getAllBookingsFromDB,
  paymentOverview,
  confirmOrderToDB,
  reminderToUsers,
  expandAreaForOrder,
};

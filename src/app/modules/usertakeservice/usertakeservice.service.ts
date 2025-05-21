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
import { locationHelper } from "../../../helpers/locationHelper";
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

  return await UserTakeService.create(data);

};

const confirmOrderToDB = async (
  orderId:ObjectId,
  userId:JwtPayload
)=>{
  const order = await UserTakeService.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
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
order!.app_fee =order.price*(fee/100)
order.total_amount = order.price + order.app_fee;

  const service = await ServiceManagement.findById(order.serviceId);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: service?.name||"demo",
          },
          unit_amount: order.total_amount* 100,
        },
        quantity: 1,
      },
    ],
    customer_email:userId?.email,
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `https://www.your.com/user/payment-success`,
    cancel_url: `https://www.your.com/user/payment-cancel`,
    metadata:{
      data:JSON.stringify({orderId})
    }
  });

  return session.url;

}

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
  user: JwtPayload
): Promise<IUserTakeService | null> => {
  const isExist = await UserTakeService.findOne({ _id: id });
  if (isExist?.isBooked === true) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service already booked !");
  }
  const userData = await User.findById(user.id);
  if(userData?.status== "inactive"){
    throw new ApiError(StatusCodes.FORBIDDEN, "you account is inactive");
  }
  
  const result = await UserTakeService.findOneAndUpdate({ _id: id }, {artiestId:user.id,artist_book_date:new Date(),isBooked:true}, { new: true });

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
    data: result,
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

// its after stripe payment
const bookOrder = async (payload:ObjectId,payment_intent:string)=>{
  try {
    const result = await UserTakeService.findOne({_id:payload});
  
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Failed to create UserTakeService"
      );
    }
  
    const updateOrder = await UserTakeService.findOneAndUpdate({_id:payload},{status:"inProgress",payment_intent:payment_intent},{new:true});
  
    const allProviders = await User.find({
      role: USER_ROLES.ARTIST,
      isActive: true,
    });
    //  📍 Filter by 5km radius
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
    })
  
    
      for (const provider of nearbyProviders) {
        await sendNotifications({
          receiver: provider._id,
          title: "New service request near you",
          message: "A new service request has been created near you",
          type: "service-request",
          filePath: "request",
          serviceId: result._id,
          userId: result.userId,
          data: payload,
        });
      }
      const nearbyOrders = await nearByOrderByLatitudeAndLongitude(result.latitude, result.longitude);
  
      
      for(const provider of nearbyProviders){
        locationHelper({ receiver: provider._id, data: nearbyOrders });
      }
      return updateOrder;
  } catch (error) {
    logger.error(error);
  }
 
}

// cacel order

const cancelOrder = async (orderId:string,user:JwtPayload,resion?:string)=>{
  const order = await UserTakeService.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }

  if(['completed','cancelled'].includes(order.status)){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is not cancellable");
  }

  if(user.role == USER_ROLES.ARTIST){
    const orderTime = new Date(order.artist_book_date!);
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - orderTime.getTime();
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const  hoursDifference = Math.floor(minutesDifference / 60);
    let status = "low"
    if(hoursDifference < 24){
      status = "high"
    }
    if(order.payment_intent){
      await stripe.refunds.create({
        payment_intent: order.payment_intent,
        amount:order.price
      });
    }
    await UserTakeService.updateOne({_id:orderId},{status:'cancelled',cancelled_by:'artist',cancelled_reason:resion,cancel_status:status});
    const high_order = await UserTakeService.countDocuments({cancel_status:'high',providerId:user.id});
    if(high_order >= 5){
      await User.findOneAndUpdate({_id:user.id},{isActive:false,status:'inactive'});
    }

    return {
      message: "Order cancelled and refunded successfully",
    }

  }

  
  const temp:any = order;
  if(!order.artist_book_date){
    await stripe.refunds.create({
      payment_intent: order.payment_intent,
      amount:order.price
    });
    await UserTakeService.updateOne({_id:orderId},{status:'cancelled'});
    return {
      message: "Order cancelled and refunded successfully with 0% cost",
    }
  }
  const orderTime = new Date(temp.createdAt);
  const currentTime = new Date(temp.artist_book_date);
  const timeDifference = currentTime.getTime() - orderTime.getTime();
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  let cost = 0;
  if(hoursDifference>24){
    cost = 0
  }
  else if (hoursDifference>4 && hoursDifference<=24){
    cost = 25
  }
  else if (hoursDifference>0 && hoursDifference<=4){
    cost = 50
  }
  else{
    cost = 50
  }

  if(order.payment_intent){
    const refund_amount = order.price! - (order.price! * (cost / 100));
    await stripe.refunds.create({
      payment_intent: order.payment_intent,
      amount: refund_amount,
    });
  }
  await UserTakeService.updateOne({_id:orderId},{status:'cancelled',cancelled_by:"user",cancelled_reason:resion});

  return {
    message: "Order cancelled and refunded successfully",
  }

}

const payoutOrderInDB =async (orderId:string)=>{
  const order = await UserTakeService.findById(orderId)
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
  }
  if(order.status != 'processing'){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order is not payable");
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
    { $inc: { balance: amount } },
  );
  await UserTakeService.updateOne({_id:orderId},{status:'completed',artist_app_fee:((order.price * cost) / 100)||0});

  //Bonus section after the completion of the order
  const clienBookings = await UserTakeService.countDocuments({userId:order.userId,status:'completed'});
  if(clienBookings==1){
    await WalletService.updateWallet(order.userId,5)
    await Reward.create({
      user: order.userId,
      occation:"UserTakeService",
      amount:5,
      occationId:order._id,
      title:'completed first booking'
    })
  }
  if(clienBookings==5){
    await WalletService.updateWallet(order.userId,5)
    await Reward.create({
      user: order.userId,
      occation:"UserTakeService",
      amount:5,
      occationId:order._id,
      title:`completed 5 bookings`
    })

  }

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);


  const monthlyBookings = await UserTakeService.countDocuments({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth},
    status:'completed',
    userId:order.userId
  });


  if(monthlyBookings==3){
    await WalletService.updateWallet(order.userId,10)
    await Reward.create({
      user: order.userId,
      occation:"UserTakeService",
      amount:10,
      occationId:order._id,
    })
    await Reward.create({
      user: order.userId,
      occation:"UserTakeService",
      amount:10,
      occationId:order._id,
      title:`completed ${monthlyBookings} bookings in the month`
    })
  }

  const artistBookings = await UserTakeService.countDocuments({
    status:'completed',
    artiestId:order.artiestId
  });
  if(artistBookings==10){
    await WalletService.updateWallet(order.artiestId!,10)
    await Reward.create({
      user: order.artiestId!,
      occation:"UserTakeService",
      amount:10,
      occationId:order._id,
      title:`completed ${monthlyBookings} bookings`
    })
  }
  
  return {
    message: "Order completed and payout successfully",
  };
}


const getAllBookingsFromDB = async (user:JwtPayload,query:Record<string,any>)=>{

  const result = new QueryBuilder(UserTakeService.find([USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN].includes(user.role)?{}:{
    $or:[
      {
        userId:user.id
      },
      {
        artiestId:user.id
      }
    ]
  }),query).sort().filter().paginate()
  const paginationInfo = await result.getPaginationInfo()
  const data = await result.modelQuery.populate([
    {
      path:"serviceId",
      select:['name','category','subCategory'],
      populate:[
        {
          path:"category",
          select:['name']
        },
      ]
    },
    {
      path:"userId",
      select:['name','email','phone','profile','isActive','status','subscription','location'],
      populate:[
        {
          path:"subscription",
          select:['package','status'],
          populate:[
            {
              path:"package",
              select:['name','price','price_offer']
            }
          ]
        }
      ]
    },
    {
      path:"artiestId",
      select:['name','email','phone','profile','isActive','status','subscription','location'],
      populate:[
        {
          path:"subscription",
          select:['package','status'],
          populate:[
            {
              path:"package",
              select:['name','price','price_offer']
            }
          ]
        }
      ]
    }
  ]).lean().exec()



  return {
    paginationInfo,
    data
  }
}

const paymentOverview = async ()=>{
  const today = new Date().toISOString().slice(0, 10);
  let totalErning = 0;
  let totalErningToday = 0;

  let totalCommission = 0;
  let totalCommissionToday = 0;

  let totalTips = 0;
  let totalTipsToday = 0;

  const orders = await UserTakeService.find({}).lean()

  orders.forEach((order:any) => {
    console.log(order);
    
    if(order.status != 'cancelled'){
      totalErning += order.price
      if(order.createdAt.toISOString().slice(0, 10) == today){
        totalErningToday += order.price
      }
    }
    totalCommission += (order.app_fee||0)
    if(order.createdAt.toISOString().slice(0, 10) == today){
      totalCommissionToday += (order.app_fee||0)
    }
  })

  const tips = await Review.find({}).lean()
  tips.forEach((tip:any) => {
    totalTips += (tip.tip||0)
    if(tip.createdAt.toISOString().slice(0, 10) == today){
      totalTipsToday += (tip.tip||0)
    }
    })
    return {
      earning:{
        total:totalErning,
        today:totalErningToday
      },
      commission:{
        total:totalCommission,
        today:totalCommissionToday
      },
      tips:{
        total:totalTips,
        today:totalTipsToday
      }
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
  confirmOrderToDB
};

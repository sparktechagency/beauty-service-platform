import mongoose from "mongoose";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { UserTakeService } from "../usertakeservice/usertakeservice.model";
import crypto from "crypto";
import { Wallet } from "../wallet/wallet.model";
import stripe from "../../../config/stripe";
import { WalletService } from "../wallet/wallet.service";
import { Reward } from "../reward/reward.model";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/queryBuilder";
import { User } from "../user/user.model";
import { sendNotificationToFCM } from "../../../helpers/firebaseNotificationHelper";
const createReviewToDB = async (payload: IReview) => {
  const session = await mongoose.startSession();
  try {

    const order = await UserTakeService.findOne({ _id: payload.order });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
    }

    if (
      ["pending"].includes(order.status)
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You can not review this order"
      );
    }

    const trxId = 'trx'+crypto.randomBytes(7).toString("hex");

    const review = await Review.create({
      ...payload,
      tip: 0,
      trxId,
      artist: order.artiestId,
      service: order.serviceId,
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

  
    const artistReviews = await Review.find({ artist: order.artiestId,createdAt:{
      $gte: startOfMonth,
      $lte: endOfMonth,

    } }).sort(
      { createdAt: -1 }
    );

 
    

    if(review.rating==5){
      let totalRating = 0;
      for (const reviewItem of artistReviews) {
        if(reviewItem.rating<5){
          break
        }
        totalRating += 1;
      }
      if(totalRating==5){
        await WalletService.updateWallet(order.artiestId!,10)
        await Reward.create({
          user:order.artiestId,
          amount:10,
          occation:"Review",
          occationId:review._id,
          title:`Strike of 5 star review`,
        })
      }
    
      
    }

    if (payload.tip) {
      const stripesession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Review",
              },
              unit_amount: payload.tip * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
      success_url: `https://www.your.com/user/payment-success`,
      cancel_url: `https://www.your.com/user/payment-cancel`,
        metadata: {
          data: JSON.stringify({
            orderId: order._id.toString(),
            artist_id: order?.artiestId?.toString()!,
            tip: payload.tip,
          }),
        },
      });
    
     

      return stripesession.url;
    }

    const customer = await User.findById(order.userId);

    const artist = await User.findById(order.artiestId);

    if(artist?.deviceToken){
      await sendNotificationToFCM({
        title:`${customer?.name} has reviewed you`,
        body:`${customer?.name} has reviewed you ${review.rating} stars`,
        token:artist?.deviceToken,
        data:{
          orderId:order._id.toString(),
        }
      })
    }

    
    
    return review;
  } catch (error: any) {
    console.error(error);
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
  } finally {
    session.endSession();
  }
};

const handleTip = async ({ tip, orderId, artist_id }: any) => {
  const wallet = await Wallet.findOneAndUpdate(
    { user: artist_id },
    { $inc: { balance: tip } },
    { new: true }
  );

  const  order = await UserTakeService.findOne({ _id: orderId });

  const customer = await User.findById(order?.userId);
  const artist = await User.findById(order?.artiestId);
  if(artist?.deviceToken){
    await sendNotificationToFCM({
      title:`${customer?.name} has reviewed you`,
      body:`${customer?.name} has reviewed you and give you $${tip} as tip`,
      token:artist?.deviceToken,
      data:{
        orderId:order?._id.toString(),
      }
    })
  }

  await Review.findOneAndUpdate({ order: orderId }, { tip });
};

const getAllReviews = async (service:string,artist:string,query:Record<string, any>) => {
  const result = new QueryBuilder(Review.find({
    service:service,
    artist:artist
  },{user:1,rating:1,comment:1,createdAt:1,tip:1}), query).sort().paginate()

  const reviews = await result.modelQuery.populate([
    {
      path: "user",
      select: "name email profile",
    },
  ])

  const paginationInfo = await result.getPaginationInfo()
  return {
    reviews,
    paginationInfo
  }
}


export const ReviewService = { createReviewToDB, handleTip, getAllReviews };

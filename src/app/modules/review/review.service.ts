import mongoose from "mongoose";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { UserTakeService } from "../usertakeservice/usertakeservice.model";
import crypto  from "crypto";
import { Wallet } from "../wallet/wallet.model";
import { Subscription } from "../subscription/subscription.model";
import { Plan } from "../plan/plan.model";
import { USER_ROLES } from "../../../enums/user";
import stripe from "../../../config/stripe";
const createReviewToDB = async (payload: IReview) => {
    const session = await mongoose.startSession();
    try {

  
      const existReview = await Review.findOne({
        user: payload.user,
        order: payload.order,
      });
  
      if (existReview) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "You have already reviewed this order"
        );
      }
  
      const order = await UserTakeService.findOne({ _id: payload.order });
  
      if (!order) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");
      }
  
      if (["cancelled", "completed",'pending','processing'].includes(order.status)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "You can not review this order"
        );
      }
  
      const trxId = crypto.randomBytes(7).toString("hex");
  
      const updateOrder = await UserTakeService.findByIdAndUpdate(
        order._id,
        { status: "processing", trxId },
        { new: true }
      );
  
      if (!updateOrder) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Order not found during update");
      }
  
      const review = await Review.create({ ...payload,tip:0, trxId,artist: order.artiestId }, );
  
   if(payload.tip){
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
        success_url: `https://www.your.com/review-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://www.your.com`,
        metadata: {
            data:JSON.stringify({
                orderId: order._id.toString(),
                artist_id: order?.artiestId?.toString()!,
                tip: payload.tip,
              })
        }
      });
      return stripesession.url;
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

    const wallet =await Wallet.findOneAndUpdate({ user: artist_id },{ $inc: { balance: tip } }, { new: true });
    await Review.findOneAndUpdate({ order: orderId }, { tip });
  }
export const ReviewService ={ createReviewToDB,handleTip}
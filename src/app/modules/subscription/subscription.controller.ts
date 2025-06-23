import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";

const subscribePlan = catchAsync( async(req: Request, res: Response)=>{
    const user = await User.findById(req.body?.userId);
    if(!user){
        throw new Error("User not found");
    }
    const result = await SubscriptionService.subscriptionToDB({
        id:user._id,
        email:user.email,
        role:user.role
    }, req.body.priceId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Created Successfully",
        data: result
    })
});
const subscribers = catchAsync( async(req: Request, res: Response)=>{
    const result = await SubscriptionService.subscriberFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription List Retrieved Successfully",
        data: result.data,
        pagination:result.meta
    })
});

const subscriptionDetails = catchAsync( async(req: Request, res: Response)=>{
    const result = await SubscriptionService.subscriptionDetailsFromDB(req.user!);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Details Retrieved Successfully",
        data: result.subscription
    })
});

const changeSubscriptionStatus = catchAsync( async(req: Request, res: Response)=>{
    const id = req.params.id;
    const {status} = req.body;
    const result = await SubscriptionService.changeSubscriptionStatus(id, status);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Status Updated Successfully",
        data: result
    })
})

const overView = catchAsync(async(req:Request,res:Response)=>{
    const query = req.query;
    const result = await SubscriptionService.overViewOfSubscription( query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Overview Retrieved Successfully",
        data: result
    })
})

const PlansData = catchAsync(async(req:Request,res:Response)=>{
    const user = req.user;
    const result = await SubscriptionService.subsriprionDetailsFromDB(user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Plans Retrieved Successfully",
        data: result
    })
})

const cancelSubscription = catchAsync(async(req:Request,res:Response)=>{
    const user = req.user;
    const result = await SubscriptionService.cancelSubscription(user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Canceled Successfully",
        data: result
    })
})

export const SubscriptionController = {
    subscribers,
    subscriptionDetails,
    subscribePlan,
    changeSubscriptionStatus,
    overView,
    PlansData,
    cancelSubscription
}
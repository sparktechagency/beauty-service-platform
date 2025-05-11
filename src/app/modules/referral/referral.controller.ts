import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReferralService } from "./referral.service";
import sendResponse from "../../../shared/sendResponse";

const createReferral = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ReferralService.createReferral(user!);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral created successfully",
        data: result,
    });
});

const getReferrals = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;
    const result = await ReferralService.getReferral(user!, query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral fetched successfully",
        data: result,
    });
});

const getReferralById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await ReferralService.getRefferralById(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral fetched successfully",
        data: result,
    });
});


export const ReferralController = {
    createReferral,
    getReferrals,
    getReferralById,
};
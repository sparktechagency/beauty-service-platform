import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReferralService } from "./referral.service";
import sendResponse from "../../../shared/sendResponse";



const getReferralsForUser = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;
    const result = await ReferralService.getReferralAndBonusesFromDB(user!);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referral fetched successfully",
        data: result,
    });
});

const getAllReferrals = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;
    const result = await ReferralService.getReferral(user!, query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Referrals fetched successfully",
        data: result.data,
        pagination: result.paginationInfo,
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
    getReferralsForUser,
    getReferralById,
    getAllReferrals,
};
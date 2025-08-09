import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { WalletService } from "./wallet.service";

const getWallet = catchAsync(async (req: Request, res: Response) => {
    const user:any = req.user;
    const query = req.query;
    const result = await WalletService.getWallet(user.id!,query);
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Wallet fetched successfully",
        data: result?.data,
        pagination: result.paginationResult,
    });
});

const getAllWithdrawsData = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await WalletService.getAllWithdraws(query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Withdraws fetched successfully",
        data: result.data,
        pagination: result.paginationResult,
    });
});
const getSingleWithdraw = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await WalletService.getSingleWithdraw(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Withdraw fetched successfully",
        data: result,
    });
});
const acceptOrRejectWithdraw = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const status = req.body.status;
    const result = await WalletService.acceptOrRejectWithdraw(id, status);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Withdraw updated successfully",
        data: result,
    });
});
const applyForWidthdraw = catchAsync(async (req: Request, res: Response) => {
    const user:any = req.user;
    const amount = req.body.amount;
    const result = await WalletService.applyForWidthdraw(user.id!, amount);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Withdraw applied successfully",
        data: result,
    });
});

const userEarnings = catchAsync(async (req: Request, res: Response) => {
    const user:any = req.user;
    const query = req.query;
    const result = await WalletService.userEarnings(user, query);
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Earnings fetched successfully",
        data: result.data,
        pagination: result.paginationResult,
    });
});


const weeklyEarnings = catchAsync(async (req: Request, res: Response) => {
    const user:any = req.user;
    const query = req.query;
    const result = await WalletService.weeklyEarningFromDb(user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Earnings fetched successfully",
        data: result
    });
});
export const WalletController = {
    getWallet,
    getAllWithdrawsData,
    getSingleWithdraw,
    acceptOrRejectWithdraw,
    applyForWidthdraw,
    userEarnings,
    weeklyEarnings
};
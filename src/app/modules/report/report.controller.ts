import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReportService } from "./report.service";
import sendResponse from "../../../shared/sendResponse";
import { USER_ROLES } from "../../../enums/user";

const createReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user:any = req.user;
    const payload = {
        ...req.body
    };
   payload.user = user.id;
    const result = await ReportService.createReportToDB(payload,user);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Report Created Successfully",
        data: result,
    });
})


const getAllReports = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await ReportService.getAllReportsFromDB(query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reports fetched Successfully",
        data: result.reports,
        pagination: result.pagination,
    });
})

const changeReportStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const body = req.body;
    const result = await ReportService.changeReportStatusToDB(id, body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Report Status Updated Successfully",
        data: result,
    });
})

const getReportById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ReportService.getReportByIdFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Report fetched Successfully",
        data: result,
    });
})

const createSupportMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user:any = req.user;
    const payload = {
        ...req.body,
        customer: user.id
    };
    const result = await ReportService.createSupportMessageToDB(payload);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Support Message Created Successfully",
        data: result,
    });
})

const getSupportMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await ReportService.getSupportMessageFromDB(query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Support Messages fetched Successfully",
        data: result.supports,
        pagination: result.pagination,
    });
})


const getSupportMessageById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ReportService.getSupportMessageByIdFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Support Message fetched Successfully",
        data: result,
    });
})

const sentReplyToSupportMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reply } = req.body;
    const result = await ReportService.sentReplyToSupportMessage(id, reply);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reply Sent Successfully",
        data: result,
    });
})

const reportEdOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user:any = req.user;
    const query = req.query;
    const result = await ReportService.reportedOrdersFromDb(query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reported Orders fetched Successfully",
        data: result.reports,
        pagination: result.pagination,
    });
})

export const ReportController = {
    createReport,
    getAllReports,
    changeReportStatus,
    getReportById,
    createSupportMessage,
    getSupportMessages,
    getSupportMessageById,
    sentReplyToSupportMessage,
    reportEdOrders
}
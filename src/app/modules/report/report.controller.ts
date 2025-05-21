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
    if(user.role == USER_ROLES.USER){
        payload.customer = user.id
    }else{
        payload.artist = user.id
    }
    const result = await ReportService.createReportToDB(payload);

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
    const { status,note } = req.body;
    const result = await ReportService.changeReportStatusToDB(id, status,note);
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

export const ReportController = {
    createReport,
    getAllReports,
    changeReportStatus,
    getReportById
}
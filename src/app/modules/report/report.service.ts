import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IReport, ISupport } from "./report.interface";
import { Report, Support } from "./report.model";
import QueryBuilder from "../../builder/queryBuilder";
import { User } from "../user/user.model";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";

const createReportToDB = async (payload: IReport): Promise<IReport> => {
    const report = await Report.create(payload);
    if (!report) throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to created Report ');
    return report;
}

const getAllReportsFromDB = async (query:Record<string,any>) => {
    const result = new QueryBuilder(Report.find(), query).sort().paginate().filter()
    const reports = await result.modelQuery.populate([
        { path: "customer", select: "name profile email" },
        { path: "artist", select: "name profile email" },
        { path: "reservation" },
    ]).lean().exec();
    const pagination = await result.getPaginationInfo();
    return {
        reports,
        pagination
    }
}

const changeReportStatusToDB = async (id: string, status: string,note?:string): Promise<IReport> => {
    const report = await Report.findByIdAndUpdate(id, { status,note }, { new: true });
    if (!report) throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to update Report ');
    return report;
}

const getReportByIdFromDB = async (id: string): Promise<IReport | null> => {
    const report = await Report.findById(id).populate(["customer", "artist", "reservation"]).lean().exec();
    return report;
}

const createSupportMessageToDB = async (payload: ISupport): Promise<ISupport> => {
    const support = await Support.create(payload);
    if (!support) throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to created Support ');
    const user = await User.findById(payload.customer);
    if (!user) throw new ApiError( StatusCodes.BAD_REQUEST, 'Customer Not Found ');
    const supportEmailTamplate = emailTemplate.sendSupportMessage({name:user.name,message:payload.message,email:user.email});
    await emailHelper.sendEmail(supportEmailTamplate)
    return support;
}

const getSupportMessageFromDB = async (query:Record<string,any>) => {
    const result = new QueryBuilder(Support.find(), query).sort().paginate().filter()
    const supports = await result.modelQuery.populate([
        { path: "customer", select: "name profile email" },

    ]).lean().exec();
    const pagination = await result.getPaginationInfo();
    return {
        supports,
        pagination
    }
}

const sentReplyToSupportMessage = async (id: string, message: string): Promise<ISupport> => {
    const support = await Support.findByIdAndUpdate(id, { reply:message,status:'resolved' }, { new: true });
    if (!support) throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to update Support ');
    const user = await User.findById(support.customer);
    if (!user) throw new ApiError( StatusCodes.BAD_REQUEST, 'Customer Not Found ');

    
    const supportEmailTamplate = emailTemplate.sendSupportMessageToUser({name:user.name,message:message,email:user.email});

    
    await emailHelper.sendEmail(supportEmailTamplate)

    return support;
}

const getSupportMessageByIdFromDB = async (id: string): Promise<ISupport | null> => {
    const support = await Support.findById(id).populate(["customer"]).lean().exec();
    return support;
}

export const ReportService = {
    createReportToDB,
    getAllReportsFromDB,
    changeReportStatusToDB,
    getReportByIdFromDB,
    createSupportMessageToDB,
    getSupportMessageFromDB,
    sentReplyToSupportMessage,
    getSupportMessageByIdFromDB
}
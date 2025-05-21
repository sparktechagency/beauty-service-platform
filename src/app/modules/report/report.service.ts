import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IReport } from "./report.interface";
import { Report } from "./report.model";
import QueryBuilder from "../../builder/queryBuilder";

const createReportToDB = async (payload: IReport): Promise<IReport> => {
    const report = await Report.create(payload);
    if (!report) throw new ApiError( StatusCodes.BAD_REQUEST, 'Failed to created Report ');
    return report;
}

const getAllReportsFromDB = async (query:Record<string,any>) => {
    const result = new QueryBuilder(Report.find(), query).sort().paginate().filter()
    const reports = await result.modelQuery.populate([
        { path: "customer", select: "name profileImage email" },
        { path: "artist", select: "name profileImage email" },
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

export const ReportService = {
    createReportToDB,
    getAllReportsFromDB,
    changeReportStatusToDB,
    getReportByIdFromDB
}
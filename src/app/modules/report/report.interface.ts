import { Model, Types } from "mongoose";

export type IReport = {
    user: Types.ObjectId;
    reservation?: Types.ObjectId;
    reason: string;
    type:"report"|'cancel';
    status?: "pending"|'resolved';
    note?:string;
    refund?: number;
};

export type ISupport = {
    customer?: Types.ObjectId;
    message: string;
    status?: "pending"|'resolved';
    reply?: string;
}


export type SupportModel = Model<ISupport, Record<string, unknown>>;
export type ReportModel = Model<IReport, Record<string, unknown>>;
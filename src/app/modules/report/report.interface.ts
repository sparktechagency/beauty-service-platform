import { Model, Types } from "mongoose";

export type IReport = {
    customer?: Types.ObjectId;
    artist?: Types.ObjectId;
    reservation?: Types.ObjectId;
    reason: [];
    type:"report"|'cancel';
    status?: "pending"|'resolved';
    note?:string;
};


export type ReportModel = Model<IReport, Record<string, unknown>>;
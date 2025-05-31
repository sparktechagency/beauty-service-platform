import { model, Schema } from "mongoose";
import { IReport, ISupport, ReportModel, SupportModel } from "./report.interface";
import ApiError from "../../../errors/ApiErrors";

import { StatusCodes } from "http-status-codes";

const reportSchema = new Schema<IReport, ReportModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        reservation: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "UserTakeService"
        },
        reason: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["report", "cancel"],
            required: true,
            default: "report"
        },
        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending"
        },
        note: {
            type: String,
            required: false
        },
        refund: {
            type: Number,
            required: false
        }
    },
    { timestamps: true }
);

const supportSchema = new Schema<ISupport,SupportModel>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "User"
        },

        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending"
        },
        reply: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
)

export const Support = model<ISupport, SupportModel>("Support", supportSchema);

export const Report = model<IReport, ReportModel>("Report", reportSchema);
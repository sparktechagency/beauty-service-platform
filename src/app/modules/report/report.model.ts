import { model, Schema } from "mongoose";
import { IReport, ReportModel } from "./report.interface";
import ApiError from "../../../errors/ApiErrors";
import { Reservation } from "../reservation/reservation.model";
import { StatusCodes } from "http-status-codes";

const reportSchema = new Schema<IReport, ReportModel>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "User"
        },
        artist: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "User"
        },
        reservation: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "UserTakeService"
        },
        reason: [
            {
                type: String,
                required: true
            }
        ],
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
        }
    },
    { timestamps: true }
);




export const Report = model<IReport, ReportModel>("Report", reportSchema);
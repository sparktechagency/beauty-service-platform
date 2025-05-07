import { model, Schema } from "mongoose";
import { IPlan, PlanModel } from "./plan.interface";
import { USER_ROLES } from "../../../enums/user";

const planSchema = new Schema<IPlan, PlanModel>({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    price_offer: {
        type: Number,
        required: true,
    },
    offers: {
        type: [String],
        required: true,
    },
    price_id: {
        type: String,
        required: true,
    },
    for: {
        type: String,
        enum: [USER_ROLES.USER,USER_ROLES.ARTIST],
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
    paymentLink: {
        type: String,
        required: true,
    },
    service_charge: {
        type: Number,
        required: false,
        default: 0,
    },
    status:{
        type:String,
        enum:["active","delete"],
        default:"active"
    }
}, {
    timestamps: true,
});

export const Plan = model<IPlan>('Plan', planSchema);
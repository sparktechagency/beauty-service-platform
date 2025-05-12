import { model, Schema } from "mongoose";
import { ISubscription, SubscriptionModel } from "./subscription.interface";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import { StatusCodes } from "http-status-codes";


const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
    {
        customerId: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        package: {
            type: Schema.Types.ObjectId,
            ref: "Plan",
            required: true
        },
        trxId: {
            type: String,
            required: true
        },
        subscriptionId: {
            type: String,
            required: true
        },
        currentPeriodStart: {
            type: Date,
            required: true
        },
        currentPeriodEnd: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["expired", "active", "cancel",'inactive'],
            default: "active",
            required: true
        },

    },
    {
        timestamps: true
    }
)


export const Subscription = model<ISubscription, SubscriptionModel>("Subscription", subscriptionSchema)
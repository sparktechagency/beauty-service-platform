import { Model, Types } from 'mongoose';

export type ISubscription = {
    customerId: string;
    price: number;
    user: Types.ObjectId;
    package: Types.ObjectId;
    trxId: string;
    subscriptionId: string;
    status: 'expired' | 'active' | 'cancel'|"inactive";
    currentPeriodStart: string;
    currentPeriodEnd: string;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
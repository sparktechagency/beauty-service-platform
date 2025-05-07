import { Model, Types } from 'mongoose';

export type ISubscription = {
    customerId: string;
    price: number;
    user: Types.ObjectId;
    package: Types.ObjectId;
    trxId: string;
    subscriptionId: string;
    status: 'expired' | 'active' | 'cancel'|"inactive";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
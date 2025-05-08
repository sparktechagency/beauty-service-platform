import { Model, ObjectId, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import Stripe from 'stripe';

export type IUser = {
    name: string;
    email: string;
    contact: string;
    location: string;
    dateOfBirth: Date;
    nickName?: string;
    status?: "active" | "inactive";
    social?: string;
    role: USER_ROLES;
    password: string;
    license?: string;
    profile?:string;
    workImage?: [string]; //TODO: ensure need to upload at list 5 images
    backGroundImage?: string; //TODO: make user for validation for artist
    subscription?: ObjectId;
    accountInfo?:{
        stripeAccountId:string,
        stripeAccountLink:string
        status:string;
        loginLink:string;
      },
}

export type UserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
    HandleConnectStripe(data:Stripe.Account):Promise<void>
} & Model<IUser>;
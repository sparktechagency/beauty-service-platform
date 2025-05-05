import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

interface IStripeAccountInfo {
    status: string;
    stripeAccountId: string;
    externalAccountId: string;
    currency: string;
}

interface IAuthenticationProps {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
}

export type IUser = {
    name: string;
    email: string;
    contact: string;
    location: string;
    dateOfBirth: Date;
    nickName: string;
    social?: {
        facebook?: string;
        twitter?: string;
        linkedIn?: string;
    };
    role: USER_ROLES;
    password: string;
    license: string;
    workImage: string; //TODO: ensure need to upload at list 5 images
    
    verified: boolean;
    authentication?: IAuthenticationProps;
    accountInformation?: IStripeAccountInfo;
}

export type UserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
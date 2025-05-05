import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
    name: string;
    email: string;
    contact: string;
    location: string;
    dateOfBirth: Date;
    nickName?: string;
    social?: string;
    role: USER_ROLES;
    password: string;
    license?: string;
    workImage?: string; //TODO: ensure need to upload at list 5 images
    backGroundImage?: string; //TODO: make user for validation for artist
}

export type UserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
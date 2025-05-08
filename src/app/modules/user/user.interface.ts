import { Model, Types } from "mongoose";
import { USER_ROLES } from "../../../enums/user";

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
  confirmPassword: string;
  license?: string;
  latitude?: number;
  longitude?: string;
  verified?: boolean;
  description?: string;
  profile?: string;
  isDeleted?: boolean;
  workImage?: [string]; //TODO: ensure need to upload at list 5 images
  backGroundImage?: string; //TODO: make user for validation for artist
  accountInformation?: {
    status: boolean;
    stripeAccountId: string;
    externalAccountId: string;
    currency: string;
    accountUrl: string;
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  isActive?: boolean;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;

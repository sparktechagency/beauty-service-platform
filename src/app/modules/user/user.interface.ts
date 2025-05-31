import { Document, Model, Types } from "mongoose";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";

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
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  description?: string;
  profile?: string;
  isDeleted?: boolean;
  accountInfo?: {
    status: boolean;
    stripeAccountId: string;
    loginLink: string;
    stripeAccountLink: string;
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  subscription?: Types.ObjectId;
  referralCode?: string;
  isActive?: boolean;
  reffralCodeDB?: string;
  createdAt?: Date;
  badge?: ADMIN_BADGE;
  categories?: Types.ObjectId[];
  state?: string;
  deviceToken?: string;
  ssn?: string;
  candidateId?: string;
  reportId?: string;
  city?: string;
  zipCode?: string;
  permissions?: string[];
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
  HandleConnectStripe(data: any): Promise<any>;
} & Model<IUser>;

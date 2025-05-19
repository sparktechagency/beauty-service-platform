import { USER_ROLES } from "../../../enums/user";
import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import unlinkFile from "../../../shared/unlinkFile";
import stripe from "../../../config/stripe";
// import QueryBuilder from "../../builder/QueryBuilder";
import { ReferralService } from "../referral/referral.service";
import { WalletService } from "../wallet/wallet.service";
import QueryBuilder from "../../builder/queryBuilder";
import { compare } from "bcrypt";
import cryptoToken from "../../../util/cryptoToken";
const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  const rafferalCode = cryptoToken(5);
  payload.reffralCodeDB = rafferalCode;
  const createUser = await User.create(payload);
  
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }
  if (createUser.role == USER_ROLES.ARTIST) {
    const wallet = await WalletService.createWallet(createUser._id);
  }

  if (payload.referralCode) {
    await ReferralService.acceptReferral(createUser._id, payload.referralCode);
  }

  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };

  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  // Save OTP in authentication field
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findByIdAndUpdate(
    createUser._id,
    { $set: { authentication } },
    { new: true }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};



const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return updateDoc;
};

///Otp Verification
const verifyOTPIntoDB = async (
  email: string,
  otp: number
): Promise<boolean> => {
  const user = await User.findOne({ email }).select("+authentication");

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!user.authentication) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Authentication field is missing"
    );
  }

  const { oneTimeCode, expireAt } = user.authentication;

  if (Date.now() > new Date(expireAt).getTime()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP expired");
  }

  if (oneTimeCode !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP");
  }

  // Mark user as verified and remove OTP
  await User.findOneAndUpdate(
    { email },
    { $set: { verified: true }, $unset: { authentication: "" } }
  );

  return true;
};
const createStripeAccoutToDB = async (
  user: JwtPayload,
  stripe_id: string = ""
) => {
  const isExistUser = await User.findById(user.id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.accountInfo?.stripeAccountId) {
    return {
      accountInfo: isExistUser.accountInfo,
    }
  }
  if (stripe_id) {
    await User.findOneAndUpdate(
      { _id: user.id },
      { $set: { "accountInfo.stripeAccountId": stripe_id } }
    );
    return isExistUser;
  }

  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    individual: {
      first_name: isExistUser.name,
      email: isExistUser.email,
    },
    business_profile: {
      mcc: "7299",
      product_description: "Freelance services on demand",
      url: "https://yourplatform.com",
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "https://your-website.com/reauth",
    return_url: "https://your-website.com/dashboard",
    type: "account_onboarding",
  });
  await User.findOneAndUpdate(
    { _id: user.id },
    {
      accountInfo: {
        stripeAccountId: account.id,
        stripeAccountLink: accountLink.url,
      },
    }
  );
  if (!account) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create account");
  }
  return {
    accountLink,
  };
};

const getUsersFromDB = async (query: Record<string, any>) => {
  const result = new QueryBuilder(
    User.find(
      { $or: [{ role: USER_ROLES.USER }, { role: USER_ROLES.ARTIST }] },
      { password: 0, accountInfo: 0 }
    ),
    query
  )
    .search(["name", "email", "contact", "location"])
    .filter()
    .sort()
    .paginate();
  const users = await result.modelQuery
    .populate(["subscription"])
    .select("-password ")
    .lean()
    .exec();
  const pagination = await result.getPaginationInfo();
  return {
    users,
    pagination,
  };
};

const deleteAccount = async (user: JwtPayload,password:string) => {
  const isExistUser = await User.findOne({ _id: user.id }).select("+password");
  

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if(isExistUser.isDeleted){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Account already deleted!");
  }
  
  const comonPass = await compare(password, isExistUser.password);
  if(!comonPass){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid password!");
  }

  
  await User.findByIdAndUpdate(user.id, {
    $set: {
      isDeleted: true,
      isActive: false,
      isVerified: false,
    },
  });
  return {
    message: "Account deleted successfully",
  };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  verifyOTPIntoDB,
  createStripeAccoutToDB,
  getUsersFromDB,
  deleteAccount,
};

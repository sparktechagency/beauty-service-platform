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
import { UserTakeService } from "../usertakeservice/usertakeservice.model";
import { CheckrService } from "../checkr/checkr.service";
import { Referral } from "../referral/referral.model";
import { Reward } from "../reward/reward.model";
import { Subscription } from "../subscription/subscription.model";
import { Document } from "../document/document.model";
const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  const rafferalCode = cryptoToken(5);
  payload.reffralCodeDB = rafferalCode;

  const createUser = await User.create(payload);
  
  if (!createUser) {
    
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
    
  }

  const wallet = await WalletService.createWallet(createUser._id);



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
  const subscription = await Subscription.findOne({ user: id });

  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  return {
    ...isExistUser.toObject(),
    isValidReferrer:(subscription && subscription?.price>18)?true:false,
  };
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
  if (isExistUser.accountInfo?.loginLink) {
    return {
      url: isExistUser.accountInfo.loginLink,
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
    url:accountLink.url,
  };
};

const getUsersFromDB = async (query: Record<string, any>) => {
  const result = new QueryBuilder(
    User.find(
      { role: { $ne: USER_ROLES.SUPER_ADMIN } },
      { password: 0, accountInfo: 0 }
    ),
    query
  )
    .search(["name", "email", "contact"])
    .filter()
    .sort()
    .paginate();
  const users = await result.modelQuery
    .populate([{
      path:"subscription",
      select:"package",
      populate:{
        path:"package",
        select:"name"
      }
    }])
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
      status:"deleted"
  });
  return {
    message: "Account deleted successfully",
  };
};

const getUserDataUsingIdFromDB = async (id:string,query: Record<string, any>) => {
  const user = await User.findOne({_id:id}).select("-password").populate([{
    path:"subscription",
    populate:{
      path:"package",
    }
  }])
  .lean();
  if(!user){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const userRecentOrder = new QueryBuilder(
    UserTakeService.find({userId:id,status:'completed'}),
    query
  ).sort().paginate()
  const userRecentOrderData = await userRecentOrder.modelQuery.populate([{
    path:"serviceId",
    select:"name"
  },{
    path:"userId",
    select:"name profile email"
  },
  {
    path:'artiestId',
    select:"name profile email"
  }

]).lean().exec();
  const pagination = await userRecentOrder.getPaginationInfo();

  return {
    data:{
      user,
      userRecentOrderData
    },
    pagination
  }
}

const updateUserDataById = async (id:string,payload:Partial<IUser>) => {
  const isExistUser = await User.findOne({_id:id});
  if(!isExistUser){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateDoc = await User.findOneAndUpdate({_id:id},payload,{
    new:true
  })
  return updateDoc;
}

const addCategoriesToUserInDB = async (userId:string,categories:string[]) => {
  const isExistUser = await User.findOne({_id:userId});
  if(!isExistUser){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateDoc = await User.findOneAndUpdate({_id:userId},{$addToSet:{categories}},{
    new:true
  })
  return updateDoc;
}

const userReportDetails = async (user:JwtPayload)=>{
  const report = await User.findOne({_id:user.id})
  const reportData = await CheckrService.getReport(report?.candidateId!)
  const referral = await Referral.countDocuments({referral_user:user.id})
  const reward = await Reward.find({user:user.id})
  const subscribePlan = await Subscription.findOne({user:user.id,status:'active'})??{}
  const document = await Document.findOne({user:user.id}).lean()
  const license = document?.license?.length ? document?.license[0]: ""
  

  return {
    license,
    reportData,
    referral,
    reward,
    subscribePlan
  }
}

const userDeleteFormDB = async (email:string,password:string) => {
  const isExistUser = await User.findOne({email}).select("+password");
  if(!isExistUser){
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const comonPass = await compare(password, isExistUser.password);
  if(!comonPass){
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid password!");
  }
  await User.findOneAndUpdate({email},{
      status:"deleted"
  })
  return {
    message:"Account deleted successfully"
  }
}

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  verifyOTPIntoDB,
  createStripeAccoutToDB,
  getUsersFromDB,
  deleteAccount,
  getUserDataUsingIdFromDB,
  updateUserDataById,
  addCategoriesToUserInDB,
  userReportDetails,
  userDeleteFormDB
};

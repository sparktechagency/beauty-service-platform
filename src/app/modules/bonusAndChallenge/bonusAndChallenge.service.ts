import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { BonusAndChallenge } from "./bonusAndChallenge.model";
import QueryBuilder from "../../builder/queryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { USER_ROLES } from "../../../enums/user";
import { User } from "../user/user.model";
import { Subscription } from "../subscription/subscription.model";
import { BONUS_USER_TYPE } from "../../../enums/bonus";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { ObjectId, Types } from "mongoose";
import { BONUS_TYPE } from "./bonusAndChallenge.interface";

const createBonusAndChallenge = async (payload: any) => {
  const result = await BonusAndChallenge.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "Failed to create Bonus and Challenge"
    );
  }
  const users = await User.aggregate([
    {
      $match: {
        role: result.role,
        verified: true,
        subsriprion: {
          $exists:["UNSUBSCRIBER","ALL"].includes(result.recipint)?false:true,
        },
      },
    },
  ]);

  for (let user of users) {
    await sendNotifications({
      title: "New Bonus and Challenge",
      isRead: false,
      message: `New Bonus and Challenge for ${result.name}`,
      receiver: user._id,
      filePath: "payment",
    });
  }

  return result;
};

const getAllBonusAndChallenge = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(BonusAndChallenge.find(), query);
  const bonusAndChallenges = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields().modelQuery;

  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: bonusAndChallenges,
    meta,
  };
};

const getBonusChalangeForUser = async (user: JwtPayload) => {
  const currentDate = new Date();
  const result = await BonusAndChallenge.find({
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
    role: user.role,
    seenBy: { $ne: user.id },
  }).sort({ createdAt: -1 });

  const userData = await User.findById(user.id);

  const subscribePlan = await Subscription.findOne({
    user: userData?._id,
    status: "active",
  }).sort({ createdAt: -1 });

  const filterData = result.filter((item) => {
    return (
      item.recipint == BONUS_USER_TYPE.ALL ||
      (item.recipint == BONUS_USER_TYPE.SUBSCRIBER && subscribePlan) ||
      (item.recipint == BONUS_USER_TYPE.UNSUBSCRIBER && !subscribePlan)
    );
  });

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bonus and Challenge doesn't exist"
    );
  }
  return filterData[0];
};

const getSingleBonusAndChallenge = async (id: string) => {
  const result = await BonusAndChallenge.findById(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bonus and Challenge doesn't exist"
    );
  }
  return result;
};
const updateBonusAndChallenge = async (id: string, payload: any) => {
  const result = await BonusAndChallenge.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bonus and Challenge doesn't exist"
    );
  }
  return result;
};
const deleteBonusAndChallenge = async (id: string) => {
  const result = await BonusAndChallenge.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bonus and Challenge doesn't exist"
    );
  }
  return result;
};

const seeBonusToDB = async (id: string, user: JwtPayload) => {
  const resutl = await BonusAndChallenge.findOneAndUpdate(
    { _id: id },
    {
      $push: {
        seenBy: user.id,
      },
    }
  );
  if (!resutl) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Bonus and Challenge doesn't exist"
    );
  }
  return resutl;
};

const currentBonusForUser = async (id: Types.ObjectId, type: BONUS_TYPE) => {
  const currentDate = new Date();
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist");
  }
  const result = await BonusAndChallenge.findOne({
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
    role: user.role,
    seenBy: { $ne: user._id },
    type: type,
    tekenUsers: { $ne: user._id },
    
  }).sort({ createdAt: -1 });

  if(!["SUBSCRIBER","ALL"].includes(result?.recipint!)){
    if(!user.subscription){
      return null
    }
  }

  return result;
};

export const BonusAndChallengeServices = {
  createBonusAndChallenge,
  getAllBonusAndChallenge,
  getSingleBonusAndChallenge,
  updateBonusAndChallenge,
  deleteBonusAndChallenge,
  getBonusChalangeForUser,
  seeBonusToDB,
  currentBonusForUser,
};

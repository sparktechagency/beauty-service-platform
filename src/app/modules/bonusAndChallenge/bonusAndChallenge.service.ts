import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { BonusAndChallenge } from "./bonusAndChallenge.model";
import QueryBuilder from "../../builder/queryBuilder";

const createBonusAndChallenge = async (payload: any) => {
  const result = await BonusAndChallenge.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "Failed to create Bonus and Challenge"
    );
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

export const BonusAndChallengeServices = {
  createBonusAndChallenge,
  getAllBonusAndChallenge,
  getSingleBonusAndChallenge,
  updateBonusAndChallenge,
  deleteBonusAndChallenge,
};

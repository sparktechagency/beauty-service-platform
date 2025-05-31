import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { BonusAndChallengeServices } from "./bonusAndChallenge.service";
import sendResponse from "../../../shared/sendResponse";

const createBonusAndChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.createBonusAndChallenge(
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge created successfully",
      data: result,
    });
  }
);

const getAllBonusAndChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.getAllBonusAndChallenge(
      req.query
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleBonusAndChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.getSingleBonusAndChallenge(
      req.params.id
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge retrieved successfully",
      data: result,
    });
  }
);

const updateBonusAndChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.updateBonusAndChallenge(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge updated successfully",
      data: result,
    });
  }
);

const deleteBonusAndChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.deleteBonusAndChallenge(
      req.params.id
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge deleted successfully",
      data: result,
    });
  }
);

const getBonusChalangeForUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.getBonusChalangeForUser(
      req.user
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge retrieved successfully",
      data: result,
    });
  }
);

const seeBonusToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BonusAndChallengeServices.seeBonusToDB(
      req.params.id,
      req.user
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bonus and Challenge retrieved successfully",
      data: result,
    });
  }
);
export const BonusAndChallengeController = {
  createBonusAndChallenge,
  getAllBonusAndChallenge,
  getSingleBonusAndChallenge,
  updateBonusAndChallenge,
  deleteBonusAndChallenge,
  getBonusChalangeForUser,
  seeBonusToDB,
};

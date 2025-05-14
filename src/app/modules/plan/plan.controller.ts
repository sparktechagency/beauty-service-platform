import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PlanService } from "./plan.service";
import sendResponse from "../../../shared/sendResponse";

const createPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.createPlanToDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Plan created successfully',
    data: result,
  });
});

const getPlans = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
  const result = await PlanService.getPlansFromDB(req.query!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plans fetched successfully',
    data: result,
  });
});
const getPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.getPlanFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan fetched successfully',
    data: result,
  });
});
const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.updatePlanToDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Plan updated successfully',
    data: result,
  });
});
export const PlanController = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
};
import { Request, Response, NextFunction } from "express";
import {
  ClientResponsibilityServices,
} from "./clientresponsibility.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createClientResponsibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...responsibilityData } = req.body;
    const result =
      await ClientResponsibilityServices.createClientResponsibilityIntoDB(
        responsibilityData
      );
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Client Responsibility created successfully",
      data:result
    })
  }
);



const getAllClientResponsibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result =
      await ClientResponsibilityServices.getAllClientResponsibilityFromDB();
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Client Responsibility retrieved successfully",
      data:result
    })
  }
)


const getSingleClientResponsibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const result =
      await ClientResponsibilityServices.getSingleClientResponsibilityFromDB(id);
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Client Responsibility retrieved successfully",
      data:result
    })
  }
)


const updateClientResponsibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const {...responsibilityData } = req.body;
    const result =
      await ClientResponsibilityServices.updateClientResponsibilityIntoDB(id,responsibilityData);
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Client Responsibility updated successfully",
      data:result
    })
  }
)
const deleteClientResponsibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params;
    const result =
      await ClientResponsibilityServices.deleteClientResponsibilityFromDB(id);
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Client Responsibility deleted successfully",
      data:result
    })
  }
)







export const ClientResponsibilityController = {
  createClientResponsibility,
  getAllClientResponsibility,
  getSingleClientResponsibility,
  updateClientResponsibility,
  deleteClientResponsibility
};

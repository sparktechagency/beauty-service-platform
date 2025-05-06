import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ServiceManagementServices } from './servicemanagement.service';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';



const createServiceManagement = catchAsync(async (req: Request, res: Response) => {
    let { addOns, ...serviceManagementData } = req.body;
  
    // Parse addOns if it's a string
    if (typeof addOns === 'string') {
      try {
        addOns = JSON.parse(addOns);
      } catch (err) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid addOns JSON format');
      }
    }
  
    const result = await ServiceManagementServices.createServiceManagementIntoDB({
      ...serviceManagementData,
      addOns,
    });
  
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "ServiceManagement created successfully",
      data: result,
    });
  });
  



const getAllServiceManagement = catchAsync(async(req:Request, res:Response)=>{
    const result = await ServiceManagementServices.getAllServiceManagementFromDB();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "ServiceManagement retrieved successfully",
        data: result,
    })
})
const getSingleServiceManagement = catchAsync(async(req:Request, res:Response)=>{
    const {id} = req.params;
    const result = await ServiceManagementServices.getSingleServiceManagementFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "ServiceManagement retrieved successfully",
        data: result,
    })
})

const updateServiceManagement = catchAsync(async(req:Request, res:Response)=>{
    const {id} = req.params;
    const {...serviceManagementData } = req.body;
    const result = await ServiceManagementServices.updateServiceManagementIntoDB(id, serviceManagementData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "ServiceManagement updated successfully",
        data: result,   
    })
})

const deleteServiceManagement = catchAsync(async(req:Request, res:Response)=>{
    const {id} = req.params;
    const result = await ServiceManagementServices.deleteServiceManagementFromDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "ServiceManagement deleted successfully",
        data: result,
    })
})

export const ServiceManagementController = { 
    createServiceManagement,
    getAllServiceManagement,
    getSingleServiceManagement,
    updateServiceManagement,
    deleteServiceManagement
};

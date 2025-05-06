import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IServiceManagement } from './servicemanagement.interface';
import { ServiceManagement } from './servicemanagement.model';



const createServiceManagementIntoDB = async(payload:IServiceManagement)=>{
    const result = await ServiceManagement.create(payload)
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST,'ServiceManagement not created')
    }
    return result
}


const getAllServiceManagementFromDB = async()=>{
    const result = await ServiceManagement.find({})
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST,'ServiceManagement not found')
    }
    return result
}
const getSingleServiceManagementFromDB = async(id:string)=>{
    const result = await ServiceManagement.findById(id)
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST,'ServiceManagement not found')
    }
    return result
}
const updateServiceManagementIntoDB = async(id:string,payload:Partial<IServiceManagement>)=>{
    const result = await ServiceManagement.findOneAndUpdate({_id:id},payload,{new:true})
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST,'ServiceManagement not found')
    }
    return result
}
const deleteServiceManagementFromDB = async(id:string)=>{
    const result = await ServiceManagement.findByIdAndDelete(id)
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST,'ServiceManagement not found')
    }
    return result
}
export const ServiceManagementServices = { 
    createServiceManagementIntoDB,
    getAllServiceManagementFromDB,
    getSingleServiceManagementFromDB,
    updateServiceManagementIntoDB,
    deleteServiceManagementFromDB
};

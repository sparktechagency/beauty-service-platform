import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IClientAgreement } from "./clientAgreement.interface";
import { clientAgreementSchema } from "./clientAgreement.model";

const createClientAgreementSchemaIntoDB = async (payload: IClientAgreement) => {
    const newClientAgreement = await clientAgreementSchema.create(payload)
    if(!newClientAgreement){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create client agreement')
    }
    return newClientAgreement;
  };


  const getAllClientAgreementSchemaFromDB = async () => {
    const clientAgreements = await clientAgreementSchema.find()
    if(!clientAgreements){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get client agreements')
    }
    return clientAgreements;
  };

  const getSingleClientAgreementSchemaFromDB = async (id: string) => {
    const clientAgreement = await clientAgreementSchema.findById(id)
    if(!clientAgreement){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get client agreement')
    }
    return clientAgreement;
  }

  const updateClientAgreementSchemaIntoDB = async (id: string, payload: Partial<IClientAgreement>) => {
    const clientAgreement = await clientAgreementSchema.findByIdAndUpdate(id, payload, {new: true})
    if(!clientAgreement){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update client agreement')
    }
    return clientAgreement;
  }


  const deleteClientAgreementSchemaFromDB = async (id: string) => {
    const clientAgreement = await clientAgreementSchema.findByIdAndDelete(id)
    if(!clientAgreement){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete client agreement')
    }
    return clientAgreement;
  }



  export const clientAgreementService = {
    createClientAgreementSchemaIntoDB,
    getAllClientAgreementSchemaFromDB,
    getSingleClientAgreementSchemaFromDB,
    updateClientAgreementSchemaIntoDB,
    deleteClientAgreementSchemaFromDB
  }
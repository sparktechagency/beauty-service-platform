import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IClientAgreement } from "./clientAgreement.interface";
import { clientAgreementSchema } from "./clientAgreement.model";
import { string } from "zod";

const createClientAgreementSchemaIntoDB = async (payload: IClientAgreement) => {
    const clientAgreement = await clientAgreementSchema.findOne({type: payload.type, for: payload.for})
    if(clientAgreement){
        const updatedClientAgreement = await clientAgreementSchema.findOneAndUpdate({_id: clientAgreement._id}, payload,{new: true})
        return updatedClientAgreement;
    }
    const newClientAgreement = await clientAgreementSchema.create(payload)
    return newClientAgreement;
  };


  const getAllClientAgreementSchemaFromDB = async (type:string,forData:string) => {
    const clientAgreements = await clientAgreementSchema.findOne({type: type,for: forData})
    return clientAgreements??"";
  };







  export const clientAgreementService = {
    createClientAgreementSchemaIntoDB,
    getAllClientAgreementSchemaFromDB,
  }
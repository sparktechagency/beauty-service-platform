import { StatusCodes } from "http-status-codes";
import { IClientResponsibility } from "./clientresponsibility.interface";
import { ClientResponsibility } from "./clientresponsibility.model";
import ApiError from "../../../errors/ApiErrors";

const createClientResponsibilityIntoDB = async (
  payload: IClientResponsibility
) => {
  const newClientResponsibility = await ClientResponsibility.create(payload);
  if (!newClientResponsibility) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create client responsibility"
    );
  }
  return newClientResponsibility;
};

const getAllClientResponsibilityFromDB = async () => {
  const allClientResponsibility = await ClientResponsibility.find({});
  if (!allClientResponsibility) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No client responsibility found");
  }
  return allClientResponsibility;
};


const getSingleClientResponsibilityFromDB = async (id: string) => {
  const singleClientResponsibility = await ClientResponsibility.findById(id);
  if (!singleClientResponsibility) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No client responsibility found");
  }
  return singleClientResponsibility;
};
const updateClientResponsibilityIntoDB = async (
  id: string,
  payload: Partial<IClientResponsibility>
) => {
  const updatedClientResponsibility = await ClientResponsibility.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  );
  if (!updatedClientResponsibility) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to update client responsibility"
    );
  }
  return updatedClientResponsibility;
}

const deleteClientResponsibilityFromDB = async (id: string) => {
  const deletedClientResponsibility = await ClientResponsibility.findByIdAndDelete(
    id
  );
  if (!deletedClientResponsibility) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to delete client responsibility"
    );
  }
  return deletedClientResponsibility;
}


export const ClientResponsibilityServices = {
  createClientResponsibilityIntoDB,
  getAllClientResponsibilityFromDB,
  getSingleClientResponsibilityFromDB,
  updateClientResponsibilityIntoDB,
  deleteClientResponsibilityFromDB  
};

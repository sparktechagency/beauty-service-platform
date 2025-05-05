import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { clientAgreementService } from "./clientAgreement.service";

const createClientAgreement = catchAsync(async (req, res) => {
  const { ...clientAgreementData } = req.body;
  const result = await clientAgreementService.createClientAgreementSchemaIntoDB(
    clientAgreementData
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client Agreement created successfully",
    data: result,
  })
});



const getAllClientAgreement = catchAsync(async (req, res) => {
  const result = await clientAgreementService.getAllClientAgreementSchemaFromDB();
 sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client Agreements retrieved successfully",
    data: result,
  })
});

const getSingleClientAgreement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await clientAgreementService.getSingleClientAgreementSchemaFromDB(id);
sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client Agreement retrieved successfully",
    data: result,
  })   
})
const updateClientAgreement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const result = await clientAgreementService.updateClientAgreementSchemaIntoDB(id, updatedData);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client Agreement updated successfully",
    data: result,
  })
})


const deleteClientAgreement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await clientAgreementService.deleteClientAgreementSchemaFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client Agreement deleted successfully",
    data: result,
  })
})

export const clientAgreementController = {
  createClientAgreement,
  getAllClientAgreement,
  getSingleClientAgreement,
  updateClientAgreement,
  deleteClientAgreement
}
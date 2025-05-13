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
  const type = req.query.type;
  const forData = req.query.for;
  const result = await clientAgreementService.getAllClientAgreementSchemaFromDB(type as string, forData as string);
 sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Client Agreements retrieved successfully",
    data: result,
  })
});





export const clientAgreementController = {
  createClientAgreement,
  getAllClientAgreement,
  
}
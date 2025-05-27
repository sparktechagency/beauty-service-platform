import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DocumentServices } from "./document.service";
import sendResponse from "../../../shared/sendResponse";
import { getMultipleFilesPath } from "../../../shared/getFilePath";

const createDocument = catchAsync(async (req: Request, res: Response) => {
  const { ...documentData } = req.body;
  const license = getMultipleFilesPath(req.files,"license")
  const portfolio = getMultipleFilesPath(req.files,"portfolio")
  const work = getMultipleFilesPath(req.files,"work")
  const background = getMultipleFilesPath(req.files,"background")
  const dashboard = getMultipleFilesPath(req.files,"dashboard")
  const result = await DocumentServices.createDocumentIntoDB(
    {
        ...documentData,
        license,
        portfolio,
        work,
        background,
        dashboard
    }
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Document created successfully",
    data: result,
  });
});
const getAllUserDocuments = catchAsync(async (req: Request, res: Response) => {
const user = req.user;


  const result = await DocumentServices.retrievedDocumentFromDB(user!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Document retrieved successfully",
    data: result,
  });
});

const updateDocument = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...documentData } = req.body;
  const license = getMultipleFilesPath(req.files,"license")
  const portfolio = getMultipleFilesPath(req.files,"portfolio")
  const work = getMultipleFilesPath(req.files,"work")
  const background = getMultipleFilesPath(req.files,"background")
  const dashboard = getMultipleFilesPath(req.files,"dashboard")
  const result = await DocumentServices.updateDocumentIntoDB(
    id,
    {
        ...documentData,
        license,
        portfolio,
        work,
        background,
        dashboard
    }
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Document updated successfully",
    data: result,
  });
});

const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DocumentServices.deleteDocumentFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Document deleted successfully",
    data: result,
  });
});

const getALlDocumentofUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = req.query;
  const result = await DocumentServices.getDocumentsofUsersFromDB(id,query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Document retrieved successfully",
    data: result,
  });
});

export const DocumentController = {
  createDocument,
  getAllUserDocuments,
  updateDocument,
  deleteDocument,
  getALlDocumentofUser,
};
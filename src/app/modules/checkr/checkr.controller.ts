import catchAsync from "../../../shared/catchAsync";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { CheckrService } from "./checkr.service";

const createCandidate = catchAsync(async (req, res) => {

  
  const result = await CheckrService.createCandidate(req.body);
  res.status(200).json({
    success: true,
    message: "Candidate created successfully",
    data: result,
  });
});


const createReport = catchAsync(async (req, res) => {
  const { candidateId } = req.params;
  const result = await CheckrService.createReport(candidateId);
  res.status(200).json({
    success: true,
    message: "Report created successfully",
    data: result,
  });
});

const getReport = catchAsync(async (req, res) => {
  const { candidateId, reportId } = req.params;
  const result = await CheckrService.getReport(candidateId);
  res.status(200).json({
    success: true,
    message: "Report retrieved successfully",
    data: result,
  });
});
const getCandidate = catchAsync(async (req, res) => {
  const { candidateId } = req.params;
  const result = await CheckrService.getCandidate(candidateId);
  res.status(200).json({
    success: true,
    message: "Candidate retrieved successfully",
    data: result,
  });
});

const postCandidateDocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files,"image")
  const result = await CheckrService.uploadDocumentOfCandidate(
    id,
    image!
  );
  res.status(200).json({
    success: true,
    message: "Candidate document created successfully",
    data: result,
  });
});

export const CheckrController = {
  createCandidate,
  createReport,
  getReport,
  getCandidate,
  postCandidateDocument,
};
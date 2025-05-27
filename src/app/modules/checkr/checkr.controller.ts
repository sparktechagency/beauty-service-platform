import catchAsync from "../../../shared/catchAsync";
import { CheckrService } from "./checkr.service";

const createCandidate = catchAsync(async (req, res) => {
  console.log(req.body);
  
  const result = await CheckrService.createCandidate(req.body);
  res.status(200).json({
    success: true,
    message: "Candidate created successfully",
    data: result,
  });
});


const createReport = catchAsync(async (req, res) => {
  const { candidateId } = req.params;
  const result = await CheckrService.createReport(candidateId, req.body);
  res.status(200).json({
    success: true,
    message: "Report created successfully",
    data: result,
  });
});

const getReport = catchAsync(async (req, res) => {
  const { candidateId, reportId } = req.params;
  const result = await CheckrService.getReport(candidateId, reportId);
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

export const CheckrController = {
  createCandidate,
  createReport,
  getReport,
  getCandidate
};
import { model, Schema } from "mongoose";
import { ICandidateReport } from "./cadidateReport.interface";

const candidateReportSchema = new Schema<ICandidateReport>(
  {
    candidateId: {
      type: String,
      required: true,
    },
    reportId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    varification_link: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
)
export const CandidateReport = model<ICandidateReport>('CandidateReport', candidateReportSchema)
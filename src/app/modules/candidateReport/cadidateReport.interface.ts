import { Model } from "mongoose";

export type ICandidateReport = {
    candidateId: string;
    reportId: string;
    status: string;
    varification_link: string;
}

export type CandidateReportModel = Model<ICandidateReport, Record<string, unknown>>;
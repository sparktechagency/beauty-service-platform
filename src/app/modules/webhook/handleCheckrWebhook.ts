import { Request, Response } from "express";
import { CheckrService } from "../checkr/checkr.service";
import { CandidateReport } from "../candidateReport/candidateReport.model";

export const handleCheckrWebhook = async (req: Request, res: Response) => {
const event = req.body;
switch (event.type) {
  case "candidate.created":
    await CheckrService.createReport(event?.data?.object?.id);
    break
  case "verification.created":
    await CandidateReport.findOneAndUpdate({reportId:event?.data?.object?.report_id},{varification_link:event?.data?.object?.verification_url});
    break
  default:
    
    console.log(`Unhandled event type ${event.type}`);
    break;
    
}

  res.status(200).json({ message:"Webhook received" });
  };
import { Request, Response } from "express";

export const handleCheckrWebhook = async (req: Request, res: Response) => {
  const { event, data } = req.body;
  if (event === "candidate.created") {
    const { id } = data;
 
  }
  if (event === "candidate.completed") {
    const { id } = data;

  }
  if (event === "candidate.failed") {

  }
  res.status(200).json({ message:"Webhook received" });
  };
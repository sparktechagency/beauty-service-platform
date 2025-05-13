import { model, Schema } from "mongoose";
import { IClientAgreement } from "./clientAgreement.interface";

const clientAgreement = new Schema<IClientAgreement>({
    content: { type: String, required: true },
    type: { type: String, enum: ["agreement", "responsibility"], required: true },
    for: { type: String, enum: ["user", "artist"], required: true },
  },
  {
    timestamps: true,
  }
);
  
  // 3. Create a Model.
  export const clientAgreementSchema = model<IClientAgreement>('clientAgreement', clientAgreement);
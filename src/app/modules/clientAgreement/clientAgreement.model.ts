import { model, Schema } from "mongoose";
import { IClientAgreement } from "./clientAgreement.interface";

const clientAgreement = new Schema<IClientAgreement>({
    name: { type: String, required: true }
  });
  
  // 3. Create a Model.
  export const clientAgreementSchema = model<IClientAgreement>('clientAgreement', clientAgreement);
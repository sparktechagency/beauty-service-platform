import { IDisclaimer } from "./disclaimer.interface";
import { Disclaimer } from "./disclaimer.model";

const createDisclaimerToDb = async (payload: IDisclaimer): Promise<IDisclaimer | null> => {
const exitDisclaimer = await Disclaimer.findOne({ type: payload.type });
  if (exitDisclaimer) {
   return await Disclaimer.findByIdAndUpdate(exitDisclaimer._id, payload);
  }
  const result = await Disclaimer.create(payload);
  return result;
};

const getAllDisclaimerFromDb = async (type:string): Promise<IDisclaimer | null> => {
  const result = await Disclaimer.findOne({type:type});
  return result;
};

export const DisclaimerService = {
  createDisclaimerToDb,
  getAllDisclaimerFromDb,
};
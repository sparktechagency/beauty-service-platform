import { BONUS_USER_TYPE } from "../../../enums/bonus";
import { USER_ROLES } from "../../../enums/user";

export type IBonusAndChallenge = {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  number: number;
  role: USER_ROLES;
  recipint: BONUS_USER_TYPE;
  amount: number;
};

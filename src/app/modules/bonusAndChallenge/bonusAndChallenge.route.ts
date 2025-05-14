import { Router } from "express";
import { BonusAndChallengeController } from "./bonusAndChallenge.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const route = Router();
route.post(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.createBonusAndChallenge
);
route.get(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.getAllBonusAndChallenge
);
route.get(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.getSingleBonusAndChallenge
);
route.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.updateBonusAndChallenge
);
route.delete(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.deleteBonusAndChallenge
);

export const BonusAndChallengeRoute = route;

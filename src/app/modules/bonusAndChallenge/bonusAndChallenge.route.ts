import { Router } from "express";
import { BonusAndChallengeController } from "./bonusAndChallenge.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();
router.post(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.createBonusAndChallenge
);
router.get(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.getAllBonusAndChallenge
);
router.get(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.getSingleBonusAndChallenge
);
router.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.updateBonusAndChallenge
);
router.delete(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  BonusAndChallengeController.deleteBonusAndChallenge
);

export const BonusAndChallengeRoute = router;

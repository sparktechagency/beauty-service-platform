import { Router } from "express";
import { BonusAndChallengeController } from "./bonusAndChallenge.controller";
import auth from "../../middlewares/auth";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import adminAuth from "../../middlewares/adminAuth";

const router = Router();
router.post(
  "/",
  adminAuth([ADMIN_BADGE.AH_MAIL_HANDLER]),
  BonusAndChallengeController.createBonusAndChallenge
);
router.get(
  "/",
  adminAuth([ADMIN_BADGE.AH_MAIL_HANDLER]),
  BonusAndChallengeController.getAllBonusAndChallenge
);

router.get("/user", auth(), BonusAndChallengeController.getBonusChalangeForUser);
router.get(
  "/:id",
  auth(),
  BonusAndChallengeController.getSingleBonusAndChallenge
);
router.patch(
  "/:id",
  adminAuth([ADMIN_BADGE.AH_MAIL_HANDLER]),
  BonusAndChallengeController.updateBonusAndChallenge
);
router.delete(
  "/:id",
  adminAuth([ADMIN_BADGE.AH_MAIL_HANDLER]),
  BonusAndChallengeController.deleteBonusAndChallenge
);

router.put(
  "/:id",
  auth(),
  BonusAndChallengeController.seeBonusToDB
)



export const BonusAndChallengeRoute = router;

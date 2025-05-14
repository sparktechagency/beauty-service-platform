import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { DisclaimerController } from "./disclaimer.controller";
import { DisclaimerValidation } from "./disclaimer.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router();
router.post(
  "/",
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
  validateRequest(DisclaimerValidation.createDisclaimerZodSchema),
  DisclaimerController.createDisclaimer
);

router.get("/", DisclaimerController.getAllDisclaimer);
export const DisclaimerRoutes = router;
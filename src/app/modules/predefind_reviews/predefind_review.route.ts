import express from "express";
import { PredefiendReviewController } from "./predefind_review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PredefiendReviewValidation } from "./predefind_review.validation";
import auth from "../../middlewares/auth";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import adminAuth from "../../middlewares/adminAuth";
const router = express.Router();

router.route("/")
  .get(PredefiendReviewController.getAllPredefiendReview)
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(PredefiendReviewValidation.createPredefindReviewZodSchema),
    PredefiendReviewController.createPredefiendReview
);
router.route("/admin-review")
  .get(adminAuth([ADMIN_BADGE.AH_CARE,ADMIN_BADGE.AH_MAIL_HANDLER]),PredefiendReviewController.adminReview)

router.route("/general").post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(PredefiendReviewValidation.createGeneralReviewZodSchema),
    PredefiendReviewController.createGeneralReview
).get(PredefiendReviewController.generalReview)
router.route("/:id").delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    PredefiendReviewController.deletePredefiendReview
)


export const PredefiendReviewRoutes = router;
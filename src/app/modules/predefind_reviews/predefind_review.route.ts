import express from "express";
import { PredefiendReviewController } from "./predefind_review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PredefiendReviewValidation } from "./predefind_review.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router();

router.route("/")
  .get(PredefiendReviewController.getAllPredefiendReview)
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(PredefiendReviewValidation.createPredefindReviewZodSchema),
    PredefiendReviewController.createPredefiendReview
);
router.route("/:id").delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    PredefiendReviewController.deletePredefiendReview
);

export const PredefiendReviewRoutes = router;
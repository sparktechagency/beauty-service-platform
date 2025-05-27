import express from "express";
import auth from "../../middlewares/auth";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionValidation } from "./subscription.validation";
import adminAuth from "../../middlewares/adminAuth";
const router = express.Router();

router.post("/",
    validateRequest(SubscriptionValidation.createSubscriptionZodSchema), 
    SubscriptionController.subscribePlan
)

router.get("/", 
    adminAuth([ADMIN_BADGE.AH_ENGAGEMENT]), 
    SubscriptionController.subscribers
);

router.get("/details", 
    auth(USER_ROLES.USER), 
    SubscriptionController.subscriptionDetails
);
router.get("/overview",
    adminAuth([ADMIN_BADGE.AH_ENGAGEMENT]),
    SubscriptionController.overView)

router.route("/:id")
    .patch(
        adminAuth([ADMIN_BADGE.AH_ENGAGEMENT]),
        validateRequest(SubscriptionValidation.createChangeSubscriptionZodSchema),
        SubscriptionController.changeSubscriptionStatus
    );




export const SubscriptionRoutes = router;
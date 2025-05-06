import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionValidation } from "./subscription.validation";
const router = express.Router();

router.post("/",
    auth(USER_ROLES.ARTIST, USER_ROLES.USER),
    validateRequest(SubscriptionValidation.createSubscriptionZodSchema), 
    SubscriptionController.subscribePlan
)

router.get("/", 
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), 
    SubscriptionController.subscriptions
);

router.get("/details", 
    auth(USER_ROLES.USER), 
    SubscriptionController.subscriptionDetails
);

router.get("/:id", 
    auth(USER_ROLES.USER), 
    SubscriptionController.companySubscriptionDetails
)

export const SubscriptionRoutes = router;
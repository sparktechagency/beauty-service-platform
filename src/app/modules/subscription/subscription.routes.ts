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
    SubscriptionController.subscribers
);

router.get("/details", 
    auth(USER_ROLES.USER), 
    SubscriptionController.subscriptionDetails
);
router.get("/overview",
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    SubscriptionController.overView)

router.route("/:id")
    .patch(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        validateRequest(SubscriptionValidation.createChangeSubscriptionZodSchema),
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        SubscriptionController.changeSubscriptionStatus
    );




export const SubscriptionRoutes = router;
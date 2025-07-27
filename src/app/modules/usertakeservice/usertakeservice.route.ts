import express from "express";
import { UserTakeServiceController } from "./usertakeservice.controller";
import auth from "../../middlewares/auth";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { UserTakeServiceValidations } from "./usertakeservice.validation";
import adminAuth from "../../middlewares/adminAuth";

const router = express.Router();

router.post(
  "/create",
  auth(USER_ROLES.USER),
  validateRequest(UserTakeServiceValidations.createServiceZodSchema),
  UserTakeServiceController.createUserTakeService
);

router.get(
  "/",
  auth(),
  UserTakeServiceController.getAllBookings
);


router.get(
  "/overview",
  adminAuth([ADMIN_BADGE.AH_CARE]),
  UserTakeServiceController.getOverview
);

router.put(
  "/online",
  auth(USER_ROLES.ARTIST),
  validateRequest(UserTakeServiceValidations.activeUserValidationZodSchema),
  UserTakeServiceController.getAllServiceForArtist
);

router.get(
  "/:id",
  auth(),
  UserTakeServiceController.getSingleService
);

router.patch(
  "/on-way/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.changeArtistOntheWay
)

router.patch(
  "/start/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.startOrderService
)

router.patch(
  "/accept/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.updateUserTakeService
);

router.route("/cancel/:id").delete(
  auth(),
  validateRequest(UserTakeServiceValidations.cancelOrderZodSchema),
  UserTakeServiceController.cancel_order
);

router.route("/confirm/:id").patch(
  auth(USER_ROLES.USER),
  UserTakeServiceController.confirmOrder
);

router.route("/complete/:id").patch(
  auth(USER_ROLES.USER),
  UserTakeServiceController.payoutOrder
);

router.route("/order-to-artist").post(
  auth(USER_ROLES.USER),
  validateRequest(UserTakeServiceValidations.createServiceZodSchema),
  UserTakeServiceController.createOrderToSpecificArtist
);



export const UserTakeServiceRoutes = router;

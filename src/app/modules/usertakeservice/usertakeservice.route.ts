import express from "express";
import { UserTakeServiceController } from "./usertakeservice.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.post(
  "/create",
  auth(USER_ROLES.USER),
  UserTakeServiceController.createUserTakeService
);

router.get(
  "/",
  auth(),
  UserTakeServiceController.getAllBookings
);

router.get(
  "/overview",
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
  UserTakeServiceController.getOverview
);

router.put(
  "/service/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.getAllServiceForArtist
);

router.get(
  "/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.getSingleService
);

router.patch(
  "/accept/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.updateUserTakeService
);

router.route("/cancel/:id").delete(
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.cancel_order
);

router.route("/confirm/:id").patch(
  auth(USER_ROLES.USER),
  UserTakeServiceController.confirmOrder
);

router.route("/payout/:id").patch(
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
  UserTakeServiceController.payoutOrder
);



export const UserTakeServiceRoutes = router;

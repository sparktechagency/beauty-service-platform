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
  "/:id",
  auth(USER_ROLES.ARTIST),
  UserTakeServiceController.updateUserTakeService
);

export const UserTakeServiceRoutes = router;

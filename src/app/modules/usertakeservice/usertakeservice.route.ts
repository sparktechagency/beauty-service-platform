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

export const UserTakeServiceRoutes = router;

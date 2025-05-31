import express from "express";
import auth from "../../middlewares/auth";
import { ADMIN_BADGE, USER_ROLES } from "../../../enums/user";
import { NotificationController } from "./notification.controller";
import adminAuth from "../../middlewares/adminAuth";
const router = express.Router();

// router.get('/',
//     auth(USER_ROLES.USER),
//     NotificationController.getNotificationFromDB
// );
// router.get('/admin',
//     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//     NotificationController.adminNotificationFromDB
// );
router.patch(
  "/:id",
  adminAuth([ADMIN_BADGE.AH_CARE,ADMIN_BADGE.AH_MAIL_HANDLER]),
  NotificationController.updateNotificationById
);
router.patch(
  "/",
  adminAuth([ADMIN_BADGE.AH_CARE,ADMIN_BADGE.AH_MAIL_HANDLER]),
  NotificationController.markAllNotification
);
router.get(
  "/",
  adminAuth([ADMIN_BADGE.AH_CARE,ADMIN_BADGE.AH_MAIL_HANDLER]),
  NotificationController.getAllNotification
);

// router.patch('/admin',
//     auth(USER_ROLES.USER),
//     NotificationController.adminReadNotification
// );

export const NotificationRoutes = router;

import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import adminAuth from '../../middlewares/adminAuth';
const router = express.Router();

router.post(
    '/',
    adminAuth(),
    validateRequest(AdminValidation.createAdminZodSchema),
    AdminController.createAdmin
);

router.get(
    '/',
    adminAuth(),
    AdminController.getAdmin
);

router.delete(
    '/:id',
    auth(USER_ROLES.SUPER_ADMIN),
    AdminController.deleteAdmin
);



export const AdminRoutes = router;

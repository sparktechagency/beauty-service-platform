import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PlanValidation } from './plan.validation';
import { PlanController } from './plan.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/')
.post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(PlanValidation.createPlanZodSchema), PlanController.createPlan)
.get( PlanController.getPlans)

router.route('/:id')
.get(auth(), PlanController.getPlan)
.patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(PlanValidation.updatePlanZodSchema), PlanController.updatePlan)

export const PlanRoutes = router;
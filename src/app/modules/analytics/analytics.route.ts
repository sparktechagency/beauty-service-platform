import express from 'express';
import { AnalyticsController } from './analytics.controller';

import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/summury',auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),AnalyticsController.getSummury); 
router.get('/yearly-earnings',auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),AnalyticsController.getYearlyEarningsSummary);
router.get('/monthly-earnings',auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),AnalyticsController.getMonthUserlyEarningsSummary);
export const AnalyticsRoutes = router;

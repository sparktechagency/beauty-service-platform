import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReportController } from './report.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReportValidation } from './report.validation';
const router = express.Router();


router.route('/')
.post( 
    auth(USER_ROLES.USER, USER_ROLES.ARTIST),
    validateRequest(ReportValidation.createReportZodSchema),
    ReportController.createReport
)
.get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    ReportController.getAllReports
)

router.route('/:id')
.patch(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    validateRequest(ReportValidation.changeReportStatusZodSchema),
    ReportController.changeReportStatus
).get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    ReportController.getReportById
)

export const ReportRoutes = router;
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReportController } from './report.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReportValidation } from './report.validation';
const router = express.Router();


router.route('/report')
.post( 
    auth(USER_ROLES.USER, USER_ROLES.ARTIST),
    validateRequest(ReportValidation.createReportZodSchema),
    ReportController.createReport
)
.get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    ReportController.getAllReports
)

router.route('/report/:id')
.patch(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    validateRequest(ReportValidation.changeReportStatusZodSchema),
    ReportController.changeReportStatus
).get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    ReportController.getReportById
)

router.route('/support')
.post(
    auth(USER_ROLES.USER,USER_ROLES.ARTIST),
    validateRequest(ReportValidation.createSupportMessageZodSchema),
    ReportController.createSupportMessage
)
.get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    ReportController.getSupportMessages
)

router.route('/support/:id')
.get(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    ReportController.getSupportMessageById
)
.patch(
    auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),
    validateRequest(ReportValidation.changeSupportStatusZodSchema),
    ReportController.sentReplyToSupportMessage
)


export const ReportRoutes = router;
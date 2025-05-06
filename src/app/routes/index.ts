import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { clientAgreementRoute } from '../modules/clientAgreement/clientAgreement.route';
import { ClientResponsibilityRoutes } from '../modules/clientresponsibility/clientresponsibility.route';
import { PlanRoutes } from '../modules/plan/plan.route';
import { SubscriptionRoutes } from '../modules/subscription/subscription.routes';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/clientAgreement", route: clientAgreementRoute},
    { path: "/clientResponsibility", route: ClientResponsibilityRoutes},
    {path:"/plan",route:PlanRoutes},
    {path:"/subscription",route:SubscriptionRoutes},
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
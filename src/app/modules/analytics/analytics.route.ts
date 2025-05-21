import express from 'express';
import { AnalyticsController } from './analytics.controller';

const router = express.Router();

router.get('/', AnalyticsController); 

export const AnalyticsRoutes = router;

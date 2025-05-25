import { Request, Response, NextFunction } from 'express';
import { AnalyticsServices } from './analytics.service';
const getSummury = async (req: Request, res: Response, next: NextFunction) => {
    const result = await AnalyticsServices.summury();
    res.status(200).json({
        success: true,
        message: 'Analytics summury fetched successfully',
        data: result,
    });
};

const getYearlyEarningsSummary = async (req: Request, res: Response, next: NextFunction) => {
    const  query = req.query;
    const result = await AnalyticsServices.yearlyEarningsSummary(query);
    res.status(200).json({
        success: true,
        message: 'Yearly earnings summary fetched successfully',
        data: result,
    });
};

const getMonthUserlyEarningsSummary = async (req: Request, res: Response, next: NextFunction) => {
    const  query = req.query;
    const result = await AnalyticsServices.yearlyUsersAndMonthlyEarningData(query);
    res.status(200).json({
        success: true,
        message: 'Monthly earnings summary fetched successfully',
        data: result,
    });
};
export const AnalyticsController = { 
    getSummury,
    getYearlyEarningsSummary,
    getMonthUserlyEarningsSummary,
};

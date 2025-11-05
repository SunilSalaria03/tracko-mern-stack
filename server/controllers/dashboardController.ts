import { Response } from 'express';
import * as helper from '../helpers/commonHelpers';
import { AuthRequest } from '../interfaces/commonInterfaces';
import { GENERAL_MESSAGES } from '../utils/constants/messages';
import { getDashboardStatsService } from '../services/dashboardService';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const period = req.query.period as 'today' | 'week' | 'month' | 'lastMonth' || 'today';
    const userId = req.user?.id;

    if (!userId) {
      return helper.failed(res, 'User not authenticated');
    }

    const result = await getDashboardStatsService({ userId, period });

    if ('error' in result) {
      return helper.failed(res, result.error);
    }

    return helper.success(res, 'Dashboard stats fetched successfully', result);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return helper.error(res, GENERAL_MESSAGES.SOMETHING_WENT_WRONG);
  }
};


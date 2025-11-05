import mongoose from "mongoose";
import { IDashboardParams } from "../interfaces/dashboardInterfaces";
import userTaskModel from "../models/userTaskModel";
import { GENERAL_MESSAGES } from "../utils/constants/messages";

const projectColors = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#6366F1",
];

export const getDashboardStatsService = async (params: IDashboardParams) => {
  try {
    const { userId, period = "today" } = params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid user ID" };
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;

      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    const projectStats = await userTaskModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          finalSubmit: true,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      {
        $unwind: "$project",
      },
      {
        $group: {
          _id: "$projectId",
          projectName: { $first: "$project.name" },
          totalHours: {
            $sum: {
              $convert: {
                input: "$spendHours",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
      },
      {
        $sort: { totalHours: -1 },
      },
    ]);

    const projects = projectStats.map((stat, index) => ({
      projectId: stat._id,
      projectName: stat.projectName,
      productiveHours: parseFloat(stat.totalHours.toFixed(1)),
      color: projectColors[index % projectColors.length],
    }));

    const totalProductiveHours = projects.reduce(
      (sum, project) => sum + project.productiveHours,
      0
    );

    let averageDailyHours = 0;
    if (period === "today") {
      averageDailyHours = totalProductiveHours;
    } else if (period === "week") {
      averageDailyHours = totalProductiveHours / 7;
    } else if (period === "month" || period === "lastMonth") {
      const daysInPeriod = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      averageDailyHours = totalProductiveHours / Math.max(daysInPeriod, 1);
    }

    return {
      period,
      projects,
      totalProductiveHours: parseFloat(totalProductiveHours.toFixed(1)),
      activeProjects: projects.length,
      averageDailyHours: parseFloat(averageDailyHours.toFixed(1)),
    };
  } catch (error) {
    console.error("Get dashboard stats service error:", error);
    const message =
      error instanceof Error
        ? error.message
        : GENERAL_MESSAGES.SOMETHING_WENT_WRONG;
    return { error: message };
  }
};

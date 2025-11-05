import type { DashboardStatsResponse, DashboardParams } from "../../utils/interfaces/dashboardInterface";
import { API_ENDPOINTS } from "../apiEndpoints";
import { createGetThunkWithParams } from "./indexThunkApis";

export const getDashboardStats = createGetThunkWithParams<
  DashboardStatsResponse,
  DashboardParams
>(
  "dashboard/getDashboardStats",
  (params) => {
    const qs = new URLSearchParams();
    if (params?.period) qs.append("period", params.period);
    const query = qs.toString();
    return `${API_ENDPOINTS.DASHBOARD.STATS}${query ? `?${query}` : ""}`;
  }
);


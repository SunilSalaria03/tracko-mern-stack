import { toISODate } from "../../utils/common/helpers";
import type {
  TimeEntryPayload,
  TimeTrackTask,
  TimeTrackTaskResponse,
  TimeTrackListParams,
  FinalSubmitPayload,
} from "../../utils/interfaces/TimeTrackInterface";
import { API_ENDPOINTS } from "../apiEndpoints";
import {
  createPostThunk,
  createDeleteThunk,
  createPutThunkWithParams,
  createGetThunkWithParams,
  createPutThunk,
} from "./indexThunkApis";

export const createTimeTrackTask = createPostThunk<TimeTrackTask, TimeEntryPayload>(
  "timeTrack/createTimeTrackTask",
  () => API_ENDPOINTS.TIME_TRACK.CREATE
);

export const getTaskList = createGetThunkWithParams<TimeTrackTaskResponse, TimeTrackListParams>(
  "timeTrack/getTaskList",
  (params) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append("page", String(params.page));
    if (params?.perPageLimit) qs.append("limit", String(params.perPageLimit));
    if (params?.search) qs.append("search", params.search);
    if (params?.sortBy) qs.append("sortBy", params.sortBy);
    if (params?.sortOrder) qs.append("sortOrder", params.sortOrder);
    if (params?.status) qs.append("status", params.status);
    if (params?.startDate) qs.append("startDate", toISODate(new Date(params.startDate)));
    if (params?.endDate) qs.append("endDate", toISODate(new Date(params.endDate)));
    const query = qs.toString();
    return `${API_ENDPOINTS.TIME_TRACK.LIST}${query ? `?${query}` : ""}`;
  }
);

export const deleteTimeTrackTask = createDeleteThunk<void>(
  "timeTrack/deleteTimeTrackTask",
  (id: string) => API_ENDPOINTS.TIME_TRACK.DELETE(id)
);

export const updateTimeTrackTask = createPutThunkWithParams<
  TimeTrackTask,
  { id: string },
  TimeEntryPayload
>("timeTrack/updateTimeTrackTask", (params) =>
  API_ENDPOINTS.TIME_TRACK.UPDATE(params.id)
);

export const finalSubmitTimeTrackTask = createPutThunk<
  any,
  FinalSubmitPayload
>("timeTrack/finalSubmitTimeTrackTask", (_data) =>
  API_ENDPOINTS.TIME_TRACK.FINAL_SUBMIT
);

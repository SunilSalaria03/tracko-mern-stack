// src/store/actions/projectActions.ts
import {
  createGetThunkWithParams,
  createPostThunk,
  createPutThunk,
  createDeleteThunk,
  createGetThunk,
} from "./indexThunkApis";
import { API_ENDPOINTS } from "../apiEndpoints";
import type {
  ProjectListParams,
  ProjectListResponse,
  Project,
  ProjectFormData,
  ProjectAssignmentPayload,
} from "../../utils/interfaces/projectInterface";

 export type UpdateProjectPayload = { id: string,data:unknown } & Partial<ProjectFormData>;

export const fetchProjects = createGetThunkWithParams<ProjectListResponse, ProjectListParams>(
  "project/fetchProjects",
  (params) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append("page", String(params.page));
    if (params?.perPageLimit) qs.append("limit", String(params.perPageLimit));
    if (params?.search) qs.append("search", params.search);
    if (params?.sortBy) qs.append("sortBy", params.sortBy);
    if (params?.sortOrder) qs.append("sortOrder", params.sortOrder);
    if (params?.status) qs.append("status", params.status);
    const query = qs.toString();
    return `${API_ENDPOINTS.PROJECTS.LIST}${query ? `?${query}` : ""}`;
  }
);
export const fetchProjectsWithoutParams = createGetThunk<ProjectListResponse>(
  "project/fetchProjectsWithoutParams",
  ( ) => {
    
    return `${API_ENDPOINTS.PROJECTS.LIST}`;
  }
);
export const createProject = createPostThunk<Project, ProjectFormData>(
  "project/createProject",
  () => API_ENDPOINTS.PROJECTS.CREATE
);

export const updateProject = createPutThunk<Project, UpdateProjectPayload>(
  "project/updateProject",
  (payload) => API_ENDPOINTS.PROJECTS.UPDATE(payload.id)
);

export const deleteProject = createDeleteThunk<void>(
  "project/deleteProject",
  (id: string) => API_ENDPOINTS.PROJECTS.DELETE(id)
);

export const assignProjects = createPostThunk<any, ProjectAssignmentPayload>(
  "project/assignProjects",
  () => API_ENDPOINTS.PROJECTS.ASSIGN
);
export const fetchAssignedProjects = createGetThunk<ProjectListResponse>(
  "project/fetchAssignedProjects",
  ( ) => {
    
    return `${API_ENDPOINTS.PROJECTS.ASSIGNED}`;
  }
);
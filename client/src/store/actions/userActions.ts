import { API_ENDPOINTS } from "../apiEndpoints";
import type { User } from "../../utils/interfaces/userInterface";
import { createDeleteThunk, createGetThunk, createPutThunk } from "./indexThunkApis";

export const fetchUsers = createGetThunk<User[]>(
    'user/fetchUsers',
    () => API_ENDPOINTS.USERS.LIST
  );
  
  export const fetchUserById = createGetThunk<User>(
    'user/fetchUserById',
    () => API_ENDPOINTS.USERS.BY_ID('')
  );
  
  export const updateUserProfile = createPutThunk<User, Partial<User>>(
    'user/updateProfile',
    () => API_ENDPOINTS.USERS.UPDATE_PROFILE
  );
  
  export const deleteUser = createDeleteThunk<string>(
    'user/deleteUser',
    () => API_ENDPOINTS.USERS.BY_ID('')
  );
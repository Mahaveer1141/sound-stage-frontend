import { api, ApiResponse } from "@/lib/api";
import { UserType } from "@/lib/api/types";

export const userApi = {
  currentUser: (): Promise<ApiResponse<UserType>> => {
    return api.get("/users/current");
  }
};

import { api, ApiResponse } from "@/lib/api";
import { UserType } from "@/lib/api/types";

export const userApi = {
  me: (): Promise<ApiResponse<UserType>> => {
    return api.get("/user/me");
  }
};

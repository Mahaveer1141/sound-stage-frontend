import { api } from "@/lib/api";
import { ApiBaseResponse, UserType } from "@/lib/api/types";

export const userApi = {
  currentUser: (): Promise<ApiBaseResponse<UserType>> => {
    return api.get("/users/current");
  },
  updateProfile: (data: FormData): Promise<ApiBaseResponse<UserType>> => {
    return api.put("/users/profile", data);
  }
};

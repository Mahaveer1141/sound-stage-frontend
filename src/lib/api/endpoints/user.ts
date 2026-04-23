import { api, ApiResponse } from "@/lib/api";
import { UserType } from "@/lib/api/types";

export const userApi = {
  currentUser: (): Promise<ApiResponse<UserType>> => {
    return api.get("/users/current");
  },
  updateProfile: (data: {
    firstName: string;
    lastName?: string;
    profilePicture?: string;
  }): Promise<ApiResponse<UserType>> => {
    return api.put("/users/profile", data);
  }
};

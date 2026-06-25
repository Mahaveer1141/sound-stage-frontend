import { api } from "@/lib/api";
import { ApiBaseResponse, UserType } from "@/lib/api/types";

export const userApi = {
  currentUser: (): Promise<ApiBaseResponse<UserType>> => {
    return api.get("/users/current");
  },
  updateProfile: (data: {
    firstName: string;
    lastName?: string;
    profilePicture?: string;
  }): Promise<ApiBaseResponse<UserType>> => {
    return api.put("/users/profile", data);
  }
};

import { api, ApiResponse } from "@/lib/api";
import { TokenPair, UserType, SignUpInput } from "@/lib/api/types";

export const userApi = {
  currentUser: (): Promise<ApiResponse<UserType>> => {
    return api.get("/user/current");
  },
  signUp: (input: SignUpInput): Promise<ApiResponse<TokenPair>> => {
    return api.post("/user/sign_up", input);
  }
};

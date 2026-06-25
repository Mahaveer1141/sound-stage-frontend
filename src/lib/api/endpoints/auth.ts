import { api } from "@/lib/api";
import type { ApiBaseResponse, TokenPair, SignUpInput } from "@/lib/api/types";

export const authApi = {
  requestOtp: (email: string): Promise<ApiBaseResponse> => {
    return api.post("/auth/request_otp", { email });
  },

  verifyOtp: (email: string, otp: string): Promise<ApiBaseResponse<TokenPair>> => {
    return api.post("/auth/verify_otp", { email, otp });
  },

  signUp: (input: SignUpInput): Promise<ApiBaseResponse<TokenPair>> => {
    return api.post("/auth/sign_up", input);
  },

  logout: (): Promise<ApiBaseResponse> => {
    return api.post("/auth/logout");
  }
} as const;

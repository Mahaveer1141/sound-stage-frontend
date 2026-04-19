import { api } from "@/lib/api";
import type { ApiResponse, TokenPair, SignUpInput } from "@/lib/api/types";

export const authApi = {
  requestOtp: (email: string): Promise<ApiResponse> => {
    return api.post("/auth/request_otp", { email });
  },

  verifyOtp: (email: string, otp: string): Promise<ApiResponse<TokenPair>> => {
    return api.post("/auth/verify_otp", { email, otp });
  },

  signUp: (input: SignUpInput): Promise<ApiResponse<TokenPair>> => {
    return api.post("/auth/sign_up", input);
  },

  logout: (): Promise<ApiResponse> => {
    return api.post("/auth/logout");
  }
} as const;

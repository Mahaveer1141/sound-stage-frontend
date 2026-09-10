import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthEmailState {
  email: string;
  isOtpVerified: boolean;
  otpExpiresAt: number | null;
}

interface AuthEmailActions {
  setEmail: (email: string) => void;
  setOtpVerified: (verified: boolean) => void;
  startOtpTimer: () => void;
  resetOtpTimer: () => void;
  clearEmail: () => void;
}

type AuthEmailStore = AuthEmailState & AuthEmailActions;

const STORE_NAME = "auth-email-storage";

const useAuthEmailStore = create<AuthEmailStore>()(
  persist(
    (set) => ({
      email: "",
      isOtpVerified: false,
      otpExpiresAt: null,
      setEmail: (email: string) => set({ email, isOtpVerified: false }),
      setOtpVerified: (isOtpVerified: boolean) => set({ isOtpVerified }),
      startOtpTimer: () => set({ otpExpiresAt: Date.now() + 60_000 }),
      resetOtpTimer: () => set({ otpExpiresAt: Date.now() + 60_000 }),
      clearEmail: () =>
        set({ email: "", isOtpVerified: false, otpExpiresAt: null })
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        email: state.email,
        isOtpVerified: state.isOtpVerified
      })
    }
  )
);

export default useAuthEmailStore;

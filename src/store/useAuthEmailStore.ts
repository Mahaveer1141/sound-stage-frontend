import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthEmailState {
  email: string;
  isOtpVerified: boolean;
}

interface AuthEmailActions {
  setEmail: (email: string) => void;
  setOtpVerified: (verified: boolean) => void;
  clearEmail: () => void;
}

type AuthEmailStore = AuthEmailState & AuthEmailActions;

const STORE_NAME = "auth-email-storage";

const useAuthEmailStore = create<AuthEmailStore>()(
  persist(
    (set) => ({
      email: "",
      isOtpVerified: false,
      setEmail: (email: string) => set({ email, isOtpVerified: false }),
      setOtpVerified: (isOtpVerified: boolean) => set({ isOtpVerified }),
      clearEmail: () => set({ email: "", isOtpVerified: false })
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export default useAuthEmailStore;

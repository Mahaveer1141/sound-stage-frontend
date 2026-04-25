import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthEmailState {
  email: string;
}

interface AuthEmailActions {
  setEmail: (email: string) => void;
  clearEmail: () => void;
}

type AuthEmailStore = AuthEmailState & AuthEmailActions;

const STORE_NAME = "auth-email-storage";

const useAuthEmailStore = create<AuthEmailStore>()(
  persist(
    (set) => ({
      email: "",
      setEmail: (email: string) => set({ email }),
      clearEmail: () => set({ email: "" })
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export default useAuthEmailStore;

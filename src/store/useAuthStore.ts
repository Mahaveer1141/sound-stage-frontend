import { getAccessToken } from "@/lib/api";
import { userApi } from "@/lib/api/endpoints/user";
import { UserType } from "@/lib/api/types";
import { create } from "zustand";

interface AuthStoreState {
  user: UserType | null;
  isLoading: boolean;
}

interface AuthStoreActions {
  fetchUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type AuthStore = AuthStoreState & AuthStoreActions;

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,

  fetchUser: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }

    try {
      const response = await userApi.currentUser();
      if (response.data) {
        set({ user: response.data });
      }
    } catch {
      set({ user: null, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    set({ isLoading: true });
    await get().fetchUser();
  }
}));

export default useAuthStore;

import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { roomApi } from "@/lib/api/endpoints/room";
import { RoomType, RoomUserType } from "@/lib/api/types";

interface RoomStoreState {
  room: RoomType | null;
  currentRoomUser: RoomUserType | null;
  hasJoined: boolean;
  isRoomLoading: boolean;
  isCurrentRoomUserLoading: boolean;
  isRaisingHand: boolean;
  raisedHandsCount: number;
  raisedHandsVersion: number;
  isRaisedHandsOpen: boolean;
  isUsersDrawerOpen: boolean;
  isChatOpen: boolean;
}

interface RoomStoreActions {
  fetchRoom: (roomId: string) => Promise<RoomType | null>;
  fetchCurrentRoomUser: (
    roomId: string,
    silent?: boolean
  ) => Promise<RoomUserType | null>;
  fetchRaisedHandsCount: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string, privateCode?: string) => Promise<boolean>;
  promoteToSpeaker: (roomId: string, userId: number) => Promise<void>;
  setRaisingHand: (isRaising: boolean) => void;
  applyHandRaisedEvent: (isHandRaised: boolean) => void;
  setRaisedHandsCount: (count: number) => void;
  setTotalUsers: (count: number) => void;
  setRaisedHandsOpen: (open: boolean) => void;
  setUsersDrawerOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  reset: () => void;
}

type RoomStore = RoomStoreState & RoomStoreActions;

const initialState: RoomStoreState = {
  room: null,
  currentRoomUser: null,
  hasJoined: false,
  isRoomLoading: false,
  isCurrentRoomUserLoading: false,
  isRaisingHand: false,
  raisedHandsCount: 0,
  raisedHandsVersion: 0,
  isRaisedHandsOpen: false,
  isUsersDrawerOpen: false,
  isChatOpen: false
};

const useRoomStore = create<RoomStore>((set, get) => ({
  ...initialState,

  fetchRoom: async (roomId) => {
    set({ isRoomLoading: true });
    try {
      const res = await roomApi.show(roomId);
      set({ room: res.data });
      return res.data;
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to fetch room"
      );
      return null;
    } finally {
      set({ isRoomLoading: false });
    }
  },

  fetchCurrentRoomUser: async (roomId, silent = false) => {
    if (!silent) set({ isCurrentRoomUserLoading: true });
    try {
      const res = await roomApi.currentRoomUser(roomId);
      set({ currentRoomUser: res.data });
      return res.data;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      if (!silent) set({ isCurrentRoomUserLoading: false });
    }
  },

  fetchRaisedHandsCount: async (roomId) => {
    try {
      const res = await roomApi.raisedHandsList(roomId, {
        page: 1,
        pageSize: 1
      });
      set({ raisedHandsCount: res.pagination.totalCount });
    } catch {
      toast.error("Failed to fetch raised hands");
    }
  },

  joinRoom: async (roomId, privateCode = "") => {
    if (get().hasJoined) return true;

    try {
      await roomApi.join(roomId, privateCode);
      await get().fetchCurrentRoomUser(roomId);
      set({ hasJoined: true });
      return true;
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to join room"
      );
      return false;
    }
  },

  promoteToSpeaker: async (roomId, userId) => {
    try {
      await roomApi.updateUserRole(roomId, userId, "speaker");
      set((s) => ({ raisedHandsVersion: s.raisedHandsVersion + 1 }));
    } catch {
      toast.error("Failed to update user role");
    }
  },

  setRaisingHand: (isRaisingHand) => set({ isRaisingHand }),

  applyHandRaisedEvent: (isHandRaised) =>
    set((s) => ({
      raisedHandsVersion: s.raisedHandsVersion + 1,
      raisedHandsCount: Math.max(
        0,
        s.raisedHandsCount + (isHandRaised ? 1 : -1)
      )
    })),

  setRaisedHandsCount: (raisedHandsCount) => set({ raisedHandsCount }),

  setTotalUsers: (totalUsers) =>
    set((s) => ({ room: s.room ? { ...s.room, totalUsers } : s.room })),
  setRaisedHandsOpen: (isRaisedHandsOpen) => set({ isRaisedHandsOpen }),
  setUsersDrawerOpen: (isUsersDrawerOpen) => set({ isUsersDrawerOpen }),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),

  reset: () => set(initialState)
}));

export default useRoomStore;

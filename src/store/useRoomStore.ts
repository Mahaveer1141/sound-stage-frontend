import { create } from "zustand";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { roomApi } from "@/lib/api/endpoints/room";
import { HandRaisedEventType, RoomType, RoomUserType } from "@/lib/api/types";

interface RoomStoreState {
  room: RoomType | null;
  currentRoomUser: RoomUserType | null;
  hasJoined: boolean;
  isRoomLoading: boolean;
  isCurrentRoomUserLoading: boolean;
  isRaisingHand: boolean;
  raisedHands: RoomUserType[];
  raisedHandsPage: number;
  raisedHandsHasMore: boolean;
  isRaisedHandsLoading: boolean;
  raisedHandsCount: number;
  raisedHandsResetKey: number;
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
  fetchRaisedHands: (roomId: string, page?: number) => Promise<void>;
  fetchNextRaisedHandsPage: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string, privateCode?: string) => Promise<boolean>;
  promoteToSpeaker: (roomId: string, userId: number) => Promise<void>;
  setRaisingHand: (isRaising: boolean) => void;
  applyHandRaisedEvent: (event: HandRaisedEventType) => void;
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
  isRoomLoading: true,
  isCurrentRoomUserLoading: false,
  isRaisingHand: false,
  raisedHands: [],
  raisedHandsPage: 1,
  raisedHandsHasMore: true,
  isRaisedHandsLoading: false,
  raisedHandsCount: 0,
  raisedHandsResetKey: 0,
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

  fetchRaisedHands: async (roomId, page = 1) => {
    set({ isRaisedHandsLoading: true });
    try {
      const res = await roomApi.raisedHandsList(roomId, {
        page,
        pageSize: 20
      });
      set((s) => ({
        raisedHands:
          page === 1
            ? res.data
            : [
                ...s.raisedHands,
                ...res.data.filter(
                  (u) => !s.raisedHands.some((e) => e.user.id === u.user.id)
                )
              ],
        raisedHandsPage: page,
        raisedHandsHasMore: page < res.pagination.totalPages,
        raisedHandsCount: res.pagination.totalCount
      }));
    } catch {
      toast.error("Failed to fetch raised hands");
    } finally {
      set({ isRaisedHandsLoading: false });
    }
  },

  fetchNextRaisedHandsPage: async (roomId) => {
    const { raisedHandsHasMore, isRaisedHandsLoading, raisedHandsPage } = get();
    if (!raisedHandsHasMore || isRaisedHandsLoading) return;
    await get().fetchRaisedHands(roomId, raisedHandsPage + 1);
  },

  joinRoom: async (roomId, privateCode = "") => {
    if (get().hasJoined) return true;

    set({ isCurrentRoomUserLoading: true });
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
    } finally {
      set({ isCurrentRoomUserLoading: false });
    }
  },

  promoteToSpeaker: async (roomId, userId) => {
    try {
      const res = await roomApi.updateUserRole(roomId, userId, "speaker");
      set((s) => ({
        raisedHands: s.raisedHands.map((u) =>
          u.user.id === userId ? res.data : u
        )
      }));
    } catch {
      toast.error("Failed to update user role");
    }
  },

  setRaisingHand: (isRaisingHand) => set({ isRaisingHand }),

  applyHandRaisedEvent: ({ userId, isHandRaised, roomUser }) => {
    const { isRaisedHandsOpen, raisedHandsHasMore, room } = get();
    const shouldReset =
      !isHandRaised && isRaisedHandsOpen && raisedHandsHasMore;
    set((s) => ({
      raisedHandsCount: Math.max(
        0,
        s.raisedHandsCount + (isHandRaised ? 1 : -1)
      ),
      raisedHands: isHandRaised
        ? !s.raisedHandsHasMore &&
          roomUser &&
          !s.raisedHands.some((u) => u.user.id === userId)
          ? [...s.raisedHands, roomUser]
          : s.raisedHands
        : s.raisedHands.filter((u) => u.user.id !== userId),
      raisedHandsResetKey: shouldReset
        ? s.raisedHandsResetKey + 1
        : s.raisedHandsResetKey
    }));
    if (shouldReset && room) {
      void get().fetchRaisedHands(String(room.id), 1);
    }
  },

  setRaisedHandsCount: (raisedHandsCount) => set({ raisedHandsCount }),

  setTotalUsers: (totalUsers) =>
    set((s) => ({ room: s.room ? { ...s.room, totalUsers } : s.room })),
  setRaisedHandsOpen: (isRaisedHandsOpen) => {
    set({ isRaisedHandsOpen });
    const roomId = get().room?.id;
    if (isRaisedHandsOpen && roomId) {
      void get().fetchRaisedHands(String(roomId), 1);
    }
  },
  setUsersDrawerOpen: (isUsersDrawerOpen) => set({ isUsersDrawerOpen }),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),

  reset: () => set(initialState)
}));

export default useRoomStore;

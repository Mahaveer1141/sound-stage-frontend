import { useEffect, useRef, useState } from "react";
import { roomApi } from "@/lib/api/endpoints/room";
import { RoomUserRole, RoomUserType } from "@/lib/api/types";
import { toast } from "sonner";

interface UseRoomUsersOptions {
  roomId: string;
  roles?: RoomUserRole[];
  isOnline?: boolean;
  query?: string;
  pageSize?: number;
  enabled?: boolean;
  silent?: boolean;
}

interface UseRoomUsersResult {
  users: RoomUserType[];
  count: number;
  setCount: (count: number) => void;
  hasMore: boolean;
  isLoading: boolean;
  hasLoaded: boolean;
  nextPage: () => void;
  backfill: (timeoutSeconds?: number) => void;
  insert: (roomUser: RoomUserType) => void;
  updateByUserId: (userId: number, patch: Partial<RoomUserType>) => void;
  removeByUserId: (userId: number) => void;
  refetch: (silent?: boolean, force?: boolean) => Promise<void>;
}

const cursorOf = (u: RoomUserType) => `${u.lastJoinedAt}_${u.id}`;

const compare = (a: RoomUserType, b: RoomUserType) =>
  a.lastJoinedAt === b.lastJoinedAt
    ? a.id - b.id
    : a.lastJoinedAt < b.lastJoinedAt
      ? -1
      : 1;

interface InsertWindowResult {
  users: RoomUserType[];
  inserted: boolean;
  dropped: boolean;
  cursor?: string;
}

export function insertWindowUser(
  list: RoomUserType[],
  roomUser: RoomUserType,
  pageSize: number
): InsertWindowResult {
  const exists = list.some((u) => u.user.id === roomUser.user.id);
  if (exists) {
    return {
      users: list.map((u) => (u.user.id === roomUser.user.id ? roomUser : u)),
      inserted: false,
      dropped: false
    };
  }

  const updatedList = [...list, roomUser].sort(compare).slice(0, pageSize);
  const inserted = updatedList.includes(roomUser);
  const newLast = updatedList[updatedList.length - 1];
  return {
    users: inserted ? updatedList : list,
    inserted,
    dropped: inserted && list.length >= pageSize,
    cursor: inserted && newLast ? cursorOf(newLast) : undefined
  };
}

export function useRoomUsers({
  roomId,
  roles,
  isOnline,
  query,
  pageSize = 20,
  enabled = true,
  silent = false
}: UseRoomUsersOptions): UseRoomUsersResult {
  const [users, setUsers] = useState<RoomUserType[]>([]);
  const [nextCursor, setNextCursor] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const backfillTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usersRef = useRef<RoomUserType[]>([]);
  const nextCursorRef = useRef("");
  const hasMoreRef = useRef(false);
  const enabledRef = useRef(enabled);
  usersRef.current = users;
  nextCursorRef.current = nextCursor;
  hasMoreRef.current = hasMore;
  enabledRef.current = enabled;

  const filtersKey = JSON.stringify({ roles, isOnline, query });

  const fetchUsers = async (
    cursor: string,
    silent = false,
    force = false,
    limit = pageSize
  ) => {
    if (!roomId || (!enabledRef.current && !force)) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) setIsLoading(true);
    try {
      const res = await roomApi.usersList(
        roomId,
        { roles, isOnline, query, cursor, limit },
        controller.signal
      );
      setUsers((prev) => {
        if (cursor === "") return res.data;
        const seen = new Set(prev.map((u) => u.id));
        return [...prev, ...res.data.filter((u) => !seen.has(u.id))];
      });
      setCount(res.pagination.totalCount);
      setNextCursor(res.pagination.nextCursor);
      setHasMore(res.pagination.hasMore);
    } catch {
      if (controller.signal.aborted) return;
      toast.error("Failed to fetch users");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setHasLoaded(true);
      }
    }
  };

  useEffect(() => {
    setHasLoaded(false);
    fetchUsers("", silent);
    return () => {
      abortRef.current?.abort();
      if (backfillTimerRef.current) clearTimeout(backfillTimerRef.current);
    };
  }, [enabled, filtersKey, silent, roomId]);

  return {
    users,
    count,
    setCount,
    hasMore,
    isLoading,
    hasLoaded,
    nextPage: () => hasMoreRef.current && fetchUsers(nextCursorRef.current),

    backfill: (timeoutDuration = 0) => {
      if (backfillTimerRef.current) clearTimeout(backfillTimerRef.current);

      backfillTimerRef.current = setTimeout(() => {
        const needed = pageSize - usersRef.current.length;
        if (hasMoreRef.current && needed > 0) {
          fetchUsers(nextCursorRef.current, true, false, needed);
        }
      }, timeoutDuration);
    },

    insert: (roomUser) => {
      const result = insertWindowUser(usersRef.current, roomUser, pageSize);
      usersRef.current = result.users;
      setUsers(result.users);
      if (result.cursor) {
        nextCursorRef.current = result.cursor;
        setNextCursor(result.cursor);
      }
      if (result.dropped) setHasMore(true);
    },

    updateByUserId: (userId, patch) => {
      if (!usersRef.current.some((u) => u.user.id === userId)) return;
      const updated = usersRef.current.map((u) =>
        u.user.id === userId ? { ...u, ...patch } : u
      );
      usersRef.current = updated;
      setUsers(updated);
    },

    removeByUserId: (userId) => {
      const updated = usersRef.current.filter((u) => u.user.id !== userId);
      usersRef.current = updated;
      setUsers(updated);
    },
    refetch: (silent = false, force = false) => fetchUsers("", silent, force)
  };
}

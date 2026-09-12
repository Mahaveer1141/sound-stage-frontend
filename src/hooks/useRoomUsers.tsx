import { useEffect, useRef, useState } from "react";
import { roomApi } from "@/lib/api/endpoints/room";
import {
  ApiPaginatedResponse,
  RoomUserRole,
  RoomUserType,
  UserType
} from "@/lib/api/types";
import { toast } from "sonner";
import { DEFAULT_PAGE } from "@/lib/constants";

interface UseRoomUsersOptions {
  roomId: string;
  blocked?: boolean;
  roles?: RoomUserRole[];
  isOnline?: boolean;
  query?: string;
  pageSize?: number;
  enabled?: boolean;
}

interface UseRoomUsersResult<T> {
  users: T[];
  page: number;
  totalPages: number;
  count: number;
  isLoading: boolean;
  nextPage: () => void;
  prevPage: () => void;
  refetch: () => void;
}

export function useRoomUsers(
  options: UseRoomUsersOptions & { blocked?: false }
): UseRoomUsersResult<RoomUserType>;
export function useRoomUsers(
  options: UseRoomUsersOptions & { blocked: true }
): UseRoomUsersResult<UserType>;

export function useRoomUsers({
  roomId,
  blocked = false,
  roles,
  isOnline,
  query,
  pageSize = 20,
  enabled = true
}: UseRoomUsersOptions): UseRoomUsersResult<RoomUserType | UserType> {
  const [users, setUsers] = useState<(RoomUserType | UserType)[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const filtersKey = JSON.stringify({ blocked, roles, isOnline, query });

  const fetchUsers = async (targetPage: number) => {
    if (!roomId || !enabled) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const res: ApiPaginatedResponse<(RoomUserType | UserType)[]> = blocked
        ? await roomApi.blockedUsersList(
            roomId,
            { query, page: targetPage, pageSize },
            controller.signal
          )
        : await roomApi.usersList(
            roomId,
            { roles, isOnline, query, page: targetPage, pageSize },
            controller.signal
          );
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
      setCount(res.pagination.totalCount);
      setPage(targetPage);
    } catch {
      if (controller.signal.aborted) return;
      toast.error(
        blocked ? "Failed to fetch blocked users" : "Failed to fetch users"
      );
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(DEFAULT_PAGE);
    return () => abortRef.current?.abort();
  }, [enabled, filtersKey]);

  return {
    users,
    page,
    totalPages,
    count,
    isLoading,
    nextPage: () => page < totalPages && fetchUsers(page + 1),
    prevPage: () => page > 1 && fetchUsers(page - 1),
    refetch: () => fetchUsers(page)
  };
}

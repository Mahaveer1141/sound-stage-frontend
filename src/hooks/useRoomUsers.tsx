import { useCallback, useEffect, useState } from "react";
import { roomApi } from "@/lib/api/endpoints/room";
import { RoomUserRole, RoomUserType } from "@/lib/api/types";
import { toast } from "sonner";

interface UseRoomUsersOptions {
  roomId: string;
  roles: RoomUserRole[];
  isOnline?: boolean;
  perPage?: number;
  enabled?: boolean;
}

export function useRoomUsers({
  roomId,
  roles,
  isOnline,
  perPage = 20,
  enabled = true
}: UseRoomUsersOptions) {
  const [users, setUsers] = useState<RoomUserType[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(
    async (targetPage: number) => {
      if (!roomId || !enabled) return;

      setIsLoading(true);
      try {
        const res = await roomApi.usersList(roomId, {
          roles,
          isOnline,
          page: targetPage,
          perPage
        });
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages);
        setCount(res.pagination.totalCount);
        setPage(targetPage);
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    },
    [roomId, roles, isOnline, perPage, enabled]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [enabled]);

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

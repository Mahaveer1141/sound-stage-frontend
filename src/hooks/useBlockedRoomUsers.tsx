import { useEffect, useRef, useState } from "react";
import { roomApi } from "@/lib/api/endpoints/room";
import { UserType } from "@/lib/api/types";
import { toast } from "sonner";
import { DEFAULT_PAGE } from "@/lib/constants";

interface UseBlockedRoomUsersOptions {
  roomId: string;
  query?: string;
  pageSize?: number;
  enabled?: boolean;
}

interface UseBlockedRoomUsersResult {
  users: UserType[];
  count: number;
  hasMore: boolean;
  isLoading: boolean;
  nextPage: () => void;
  refetch: (silent?: boolean, force?: boolean) => void;
}

export function useBlockedRoomUsers({
  roomId,
  query,
  pageSize = 20,
  enabled = true
}: UseBlockedRoomUsersOptions): UseBlockedRoomUsersResult {
  const [users, setUsers] = useState<UserType[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const filtersKey = JSON.stringify({ query });

  const fetchUsers = async (
    targetPage: number,
    silent = false,
    force = false
  ) => {
    if (!roomId || (!enabled && !force)) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) setIsLoading(true);
    try {
      const res = await roomApi.blockedUsersList(
        roomId,
        { query, page: targetPage, pageSize },
        controller.signal
      );
      setUsers((prev) =>
        targetPage === DEFAULT_PAGE ? res.data : [...prev, ...res.data]
      );
      setTotalPages(res.pagination.totalPages);
      setCount(res.pagination.totalCount);
      setPage(targetPage);
    } catch {
      if (controller.signal.aborted) return;
      toast.error("Failed to fetch blocked users");
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const hasMore = page < totalPages;

  useEffect(() => {
    fetchUsers(DEFAULT_PAGE);
    return () => abortRef.current?.abort();
  }, [enabled, filtersKey]);

  return {
    users,
    count,
    hasMore,
    isLoading,
    nextPage: () => hasMore && fetchUsers(page + 1),
    refetch: (silent = false, force = false) =>
      fetchUsers(DEFAULT_PAGE, silent, force)
  };
}

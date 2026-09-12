"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { VirtuosoGrid } from "react-virtuoso";
import Loader from "@/components/loader";
import { Spinner } from "@/components/ui/spinner";
import type { ApiPaginatedResponse, QueryParams } from "@/lib/api/types";

interface InfiniteScrollProps<T> {
  fetcher: (
    page: number,
    pageSize: number,
    params?: QueryParams,
    signal?: AbortSignal
  ) => Promise<ApiPaginatedResponse<T[]>>;
  params?: QueryParams;
  page?: number;
  pageSize?: number;
  className?: string;
  style?: React.CSSProperties;
  useWindowScroll?: boolean;
  loader?: React.ReactNode;
  emptyPlaceholder?: React.ReactNode;
  onTotalCount?: (totalCount: number) => void;
  children: (item: T, index: number) => React.ReactNode;
}

export function InfiniteScroll<T>({
  fetcher,
  params,
  page = 1,
  pageSize = 10,
  className = "space-y-4",
  style,
  useWindowScroll = true,
  loader,
  emptyPlaceholder,
  onTotalCount,
  children
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const serializedParams = JSON.stringify(params);

  const fetchItems = async (pageToFetch: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const res = await fetcher(
        pageToFetch,
        pageSize,
        params,
        controller.signal
      );
      setItems((prev) =>
        pageToFetch === page ? res.data : [...prev, ...res.data]
      );
      setHasMore(pageToFetch < res.pagination.totalPages);
      setCurrentPage(pageToFetch + 1);
      onTotalCount?.(res.pagination.totalCount);
    } catch (err) {
      if (controller.signal.aborted) return;
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setCurrentPage(page);
    setHasMore(true);
    fetchItems(page);
    return () => abortRef.current?.abort();
  }, [serializedParams, page]);

  const loadMore = () => {
    if (hasMore && !isLoading) fetchItems(currentPage);
  };

  const Footer = useCallback(
    () =>
      isLoading ? (
        <div className="py-8 flex justify-center">
          <Spinner className="size-8" />
        </div>
      ) : null,
    [isLoading]
  );

  if (items.length === 0 && isLoading) {
    return <>{loader ?? <Loader />}</>;
  }

  if (items.length === 0 && !hasMore) {
    return <>{emptyPlaceholder}</>;
  }

  return (
    <VirtuosoGrid<T>
      data={items}
      useWindowScroll={useWindowScroll}
      style={style}
      endReached={loadMore}
      overscan={200}
      listClassName={className}
      itemContent={(index, item) => children(item, index)}
      components={{ Footer }}
    />
  );
}

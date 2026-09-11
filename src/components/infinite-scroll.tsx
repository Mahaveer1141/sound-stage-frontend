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
    perPage: number,
    params?: QueryParams
  ) => Promise<ApiPaginatedResponse<T[]>>;
  params?: QueryParams;
  page?: number;
  perPage?: number;
  className?: string;
  onTotalCount?: (totalCount: number) => void;
  children: (item: T, index: number) => React.ReactNode;
}

export function InfiniteScroll<T>({
  fetcher,
  params,
  page = 1,
  perPage = 10,
  className = "space-y-4",
  onTotalCount,
  children
}: InfiniteScrollProps<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const onTotalCountRef = useRef(onTotalCount);
  onTotalCountRef.current = onTotalCount;

  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(
    async (pageToFetch: number) => {
      setIsLoading(true);
      try {
        const res = await fetcherRef.current(
          pageToFetch,
          perPage,
          paramsRef.current
        );
        setItems((prev) => {
          const newItems =
            pageToFetch === page ? res.data : [...prev, ...res.data];
          return newItems;
        });
        setHasMore(pageToFetch < res.pagination.totalPages);
        setCurrentPage(pageToFetch + 1);
        onTotalCountRef.current?.(res.pagination.totalCount);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsLoading(false);
      }
    },
    [perPage, page]
  );

  const serializedParams = JSON.stringify(params);

  useEffect(() => {
    setItems([]);
    setCurrentPage(page);
    setHasMore(true);
    fetchItems(page);
  }, [serializedParams, page, fetchItems]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchItems(currentPage);
    }
  }, [hasMore, isLoading, currentPage, fetchItems]);

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
    return <Loader />;
  }

  return (
    <VirtuosoGrid<T>
      data={items}
      useWindowScroll
      endReached={loadMore}
      overscan={200}
      listClassName={className}
      itemContent={(index, item) => children(item, index)}
      components={{ Footer }}
    />
  );
}

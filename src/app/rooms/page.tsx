"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RoomCard from "@/components/room-card";
import FloatingOrbs from "@/components/floating-orbs";
import { FilterDropdown } from "@/components/filter-dropdown";
import type { FilterConfig } from "@/components/filter-dropdown";
import { Search, Plus, Filter } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";
import { roomApi } from "@/lib/api/endpoints/room";
import { categoryApi } from "@/lib/api/endpoints/category";
import { tagApi } from "@/lib/api/endpoints/tag";
import type { RoomType, RoomQuery } from "@/lib/api/types";
import { InfiniteScroll } from "@/components/infinite-scroll";

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" }
];

const filters: FilterConfig[] = [
  {
    key: "categories",
    label: "Categories",
    fetcher: async () => {
      const res = await categoryApi.list();
      return res.data.map((c) => ({
        value: String(c.id),
        label: c.name,
        description: c.description ?? undefined
      }));
    },
    useApiSearch: false,
    multi: true
  },
  {
    key: "tags",
    label: "Tags",
    fetcher: async (search) => {
      const res = await tagApi.list({ query: search, perPage: 10 });
      return res.data.map((t) => ({ value: String(t.id), label: t.name }));
    },
    useApiSearch: true,
    multi: true
  },
  {
    key: "favourites",
    label: "Favourites Only",
    fetcher: async () => {
      return BOOLEAN_OPTIONS;
    },
    useApiSearch: false,
    multi: false
  },
  {
    key: "mine",
    label: "My Rooms",
    fetcher: async () => {
      return BOOLEAN_OPTIONS;
    },
    useApiSearch: false,
    multi: false
  }
];

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const { isUserLoading } = useAuthGuard();

  const activeFilterCount = useMemo(() => {
    return (
      (selectedFilters.categories?.length ?? 0) +
      (selectedFilters.tags?.length ?? 0) +
      (selectedFilters.favourites?.length ?? 0) +
      (selectedFilters.mine?.length ?? 0)
    );
  }, [selectedFilters]);

  const roomQuery: RoomQuery = useMemo(() => {
    return {
      query: searchQuery || undefined,
      categoryIds: selectedFilters.categories?.length
        ? selectedFilters.categories
        : undefined,
      tagIds: selectedFilters.tags?.length ? selectedFilters.tags : undefined,
      favourited: selectedFilters.favourites?.length
        ? selectedFilters.favourites[0] === "true"
        : undefined,
      mine: selectedFilters.mine?.length
        ? selectedFilters.mine[0] === "true"
        : undefined
    };
  }, [searchQuery, selectedFilters]);

  if (isUserLoading) {
    return <Loader />;
  }

  const filterTrigger = (
    <Button variant="glass" className="gap-2 sm:w-auto">
      <Filter className="w-4 h-4" />
      Filters
      {activeFilterCount > 0 && (
        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4">
      <FloatingOrbs />

      <div className="container mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Live Stages</h1>
              <p className="text-muted-foreground">
                Join a conversation or start your own stage
              </p>
            </div>
            <Link href="/rooms/create">
              <Button variant="glow" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground z-10 pointer-events-none" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass border-border/50 focus:border-primary"
              />
            </div>

            <FilterDropdown
              filters={filters}
              value={selectedFilters}
              onChange={setSelectedFilters}
              trigger={filterTrigger}
            />
          </div>
        </motion.div>

        <div>
          <InfiniteScroll<RoomType>
            fetcher={(page, perPage, params) =>
              roomApi.list({ ...params, page, perPage })
            }
            params={roomQuery}
            perPage={10}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <RoomCard {...room} />
              </motion.div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Rooms;

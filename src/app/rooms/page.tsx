"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RoomCard from "@/components/room-card";
import FloatingOrbs from "@/components/floating-orbs";
import { Search, Plus, Filter } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";
import { roomApi } from "@/lib/api/endpoints/room";
import { RoomType, RoomQuery } from "@/lib/api/types";
import { InfiniteScroll } from "@/components/infinite-scroll";

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { isUserLoading } = useAuthGuard();

  if (isUserLoading) {
    return <Loader />;
  }

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
            <Button variant="glass" className="gap-2 sm:w-auto">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </motion.div>

        <div>
          <InfiniteScroll<RoomType>
            fetcher={(page, perPage, params) =>
              roomApi.list({ ...params, page, perPage } as unknown as RoomQuery)
            }
            params={{ search: searchQuery }}
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

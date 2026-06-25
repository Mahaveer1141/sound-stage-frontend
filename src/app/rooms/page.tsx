"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { RoomType } from "@/lib/api/types";

const categories = [
  "All",
  "Technology",
  "Business",
  "Music",
  "Crypto",
  "Wellness",
  "Gaming"
];

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isUserLoading } = useAuthGuard();

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All";
    return matchesSearch && matchesCategory;
  });

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await roomApi.list();
      setRooms(res.data);
    } catch (error) {
      toast.error("Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (isUserLoading || isLoading) {
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "glass"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <RoomCard {...room} />
            </motion.div>
          ))}
        </motion.div>

        {filteredRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg mb-4">
              No rooms found matching your criteria
            </p>
            <Link href="/rooms/create">
              <Button variant="glow">Create a Room</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Rooms;

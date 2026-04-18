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

const mockRooms = [
  {
    id: "1",
    name: "Tech Talk: The Future of AI and Machine Learning",
    topic: "Technology",
    speakersCount: 3,
    listenersCount: 847,
    isLive: true,
    speakers: [
      {
        name: "Alex Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
      },
      {
        name: "Sarah Kim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
      },
      {
        name: "Mike Ross",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike"
      }
    ]
  },
  {
    id: "2",
    name: "Startup Stories: Lessons from Failed Ventures",
    topic: "Business",
    speakersCount: 2,
    listenersCount: 324,
    isLive: true,
    speakers: [
      {
        name: "Emma Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
      },
      {
        name: "David Park",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david"
      }
    ]
  },
  {
    id: "3",
    name: "Music Production Tips & Tricks",
    topic: "Music",
    speakersCount: 4,
    listenersCount: 512,
    isLive: true,
    speakers: [
      {
        name: "Luna Mars",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luna"
      },
      {
        name: "Jake Blues",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake"
      },
      {
        name: "Nina Soul",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nina"
      },
      {
        name: "Tom Beat",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom"
      }
    ]
  },
  {
    id: "4",
    name: "Crypto & Web3: What's Next?",
    topic: "Crypto",
    speakersCount: 2,
    listenersCount: 189,
    isLive: false,
    speakers: [
      {
        name: "Vitalik V.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vitalik"
      },
      {
        name: "Satoshi N.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=satoshi"
      }
    ]
  },
  {
    id: "5",
    name: "Meditation & Mindfulness Session",
    topic: "Wellness",
    speakersCount: 1,
    listenersCount: 76,
    isLive: true,
    speakers: [
      {
        name: "Zen Master",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zen"
      }
    ]
  },
  {
    id: "6",
    name: "Game Dev Talk: Building Indie Games",
    topic: "Gaming",
    speakersCount: 3,
    listenersCount: 234,
    isLive: false,
    speakers: [
      {
        name: "Pixel Pete",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pixel"
      },
      {
        name: "Sprite Sam",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sprite"
      },
      {
        name: "Code Carl",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=code"
      }
    ]
  }
];

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

  const { isUserLoading } = useAuthGuard();

  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || room.topic === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

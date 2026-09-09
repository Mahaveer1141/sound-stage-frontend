"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Radio } from "lucide-react";
import { motion } from "framer-motion";
import AudioWave from "./audio-wave";
import type { FileAttachmentType } from "@/lib/api/types";

interface RoomCardProps {
  id: string;
  name: string;
  totalUsers?: number;
  liveUsers?: number;
  coverImage?: FileAttachmentType;
  logoImage?: FileAttachmentType;
}

const RoomCard = ({
  id,
  name,
  totalUsers,
  liveUsers,
  coverImage,
  logoImage
}: RoomCardProps) => {
  const isLive = (liveUsers ?? 0) > 0;

  const coverUrl =
    coverImage?.url ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
  const logoUrl =
    logoImage?.url ||
    "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";

  return (
    <Link href={`/rooms/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="glass py-0 glass-hover cursor-pointer group overflow-hidden">
          <div className="relative w-full h-32">
            <img
              src={coverUrl}
              alt={`${name} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-full border-2 border-card bg-background overflow-hidden">
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-medium">
                      OFFLINE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:gradient-text transition-all duration-300 line-clamp-2">
                  {name}
                </h3>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <AudioWave isActive={isLive} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{totalUsers ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>{liveUsers ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default RoomCard;

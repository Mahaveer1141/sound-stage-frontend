"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Radio, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AudioWave from "@/components/audio-wave";
import { roomUserFavouriteApi } from "@/lib/api/endpoints/room-user-favourite";
import type {
  FileAttachmentType,
  CategoryType,
  TagType,
  RoomAccessType
} from "@/lib/api/types";
import { DEFAULT_ROOM_COVER, DEFAULT_ROOM_LOGO } from "@/lib/constants";

interface RoomCardProps {
  id: number;
  name: string;
  type?: RoomAccessType;
  totalUsers?: number;
  liveUsers?: number;
  isFavourited?: boolean;
  coverImage?: FileAttachmentType;
  logoImage?: FileAttachmentType;
  categories?: CategoryType[];
  tags?: TagType[];
}

const RoomCard = ({
  id,
  name,
  type,
  totalUsers,
  liveUsers,
  isFavourited: initialFavourited = false,
  coverImage,
  logoImage,
  categories,
  tags
}: RoomCardProps) => {
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const [isToggling, setIsToggling] = useState(false);
  const isLive = (liveUsers ?? 0) > 0;

  const handleFavourite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isToggling) return;

    setIsToggling(true);
    const newFavourited = !isFavourited;

    try {
      if (newFavourited) {
        await roomUserFavouriteApi.add(id);
        toast.success("Room added to favorites");
      } else {
        await roomUserFavouriteApi.remove(id);
        toast.success("Room removed from favorites");
      }
      setIsFavourited(newFavourited);
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setIsToggling(false);
    }
  };

  const coverUrl = coverImage?.url || DEFAULT_ROOM_COVER;
  const logoUrl = logoImage?.url || DEFAULT_ROOM_LOGO;

  return (
    <Link href={`/rooms/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="glass py-0 glass-hover cursor-pointer group overflow-hidden">
          <div className="relative w-full h-32">
            <Image
              src={coverUrl}
              alt={`${name} cover`}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-full border-2 border-card bg-background overflow-hidden">
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                sizes="48px"
                className="object-cover"
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
                  {type === "private" && (
                    <span
                      title="Private room — invite code required"
                      className="flex items-center p-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:gradient-text transition-all duration-300 line-clamp-2">
                  {name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={handleFavourite}
                  aria-pressed={isFavourited}
                  title={
                    isFavourited ? "Remove from favorites" : "Add to favorites"
                  }
                  className={`p-1.5 rounded-full hover:bg-muted hover:cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
                    isToggling ? "opacity-50" : ""
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      isFavourited ? "text-yellow-400" : "text-muted-foreground"
                    }`}
                    fill={isFavourited ? "currentColor" : "none"}
                  />
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <AudioWave isActive={isLive} size="sm" />
                </div>
              </div>
            </div>

            {categories && categories.length > 0 && (
              <div className="flex items-center gap-2 pt-2 mb-5">
                {categories.map((category) => (
                  <span
                    title={category.description}
                    key={category.id}
                    className="px-2 py-1 rounded-full bg-primary/10 text-xs text-primary"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {tags && tags.length > 0 && (
              <div className="flex items-center gap-2 pt-2 mb-5">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-border/50">
              <div
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
                title={`Users in Room: ${totalUsers ?? 0}`}
              >
                <Users className="w-4 h-4" />
                <span>{totalUsers ?? 0}</span>
              </div>
              <div
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
                title={`Live users in Room: ${liveUsers ?? 0}`}
              >
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

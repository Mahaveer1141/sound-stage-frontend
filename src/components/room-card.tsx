"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mic, Radio } from "lucide-react";
import { motion } from "framer-motion";
import AudioWave from "./audio-wave";

interface RoomCardProps {
  id: string;
  name: string;
  topic: string;
  speakersCount: number;
  listenersCount: number;
  isLive: boolean;
  speakers: { name: string; avatar: string }[];
}

const RoomCard = ({
  id,
  name,
  topic,
  speakersCount,
  listenersCount,
  isLive,
  speakers
}: RoomCardProps) => {
  return (
    <Link href={`/rooms/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="glass glass-hover cursor-pointer group overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isLive && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Radio className="w-3 h-3" />
                    {topic}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:gradient-text transition-all duration-300 line-clamp-2">
                  {name}
                </h3>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <AudioWave isActive={isLive} size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {speakers.slice(0, 3).map((speaker, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-card overflow-hidden"
                  >
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {speakers.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{speakers.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                {speakers.slice(0, 2).map((speaker, i) => (
                  <span key={i} className="text-xs text-muted-foreground">
                    {speaker.name}
                    {i === 0 && speakers.length > 1 && ","}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>{speakersCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{listenersCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default RoomCard;

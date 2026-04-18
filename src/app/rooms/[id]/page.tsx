"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ParticipantAvatar from "@/components/participant-avatar";
import AudioWave from "@/components/audio-wave";
import FloatingOrbs from "@/components/floating-orbs";
import {
  Mic,
  MicOff,
  Hand,
  LogOut,
  MoreHorizontal,
  Users,
  Share2,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Loader from "@/components/loader";

const mockRoom = {
  id: "1",
  name: "Tech Talk: The Future of AI and Machine Learning",
  topic: "Technology",
  description:
    "Join us for an in-depth discussion about AI, machine learning, and what the future holds.",
  speakers: [
    {
      id: "1",
      name: "Alex Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      isSpeaking: true,
      isMuted: false,
      isAdmin: true
    },
    {
      id: "2",
      name: "Sarah Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      isSpeaking: false,
      isMuted: true,
      isAdmin: false
    },
    {
      id: "3",
      name: "Mike Ross",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      isSpeaking: false,
      isMuted: false,
      isAdmin: false
    }
  ],
  listeners: [
    {
      id: "4",
      name: "Emma W.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      isRaisingHand: true
    },
    {
      id: "5",
      name: "David P.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
      isRaisingHand: false
    },
    {
      id: "6",
      name: "Luna M.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luna",
      isRaisingHand: false
    },
    {
      id: "7",
      name: "Jake B.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake",
      isRaisingHand: true
    },
    {
      id: "8",
      name: "Nina S.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nina",
      isRaisingHand: false
    },
    {
      id: "9",
      name: "Tom B.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom",
      isRaisingHand: false
    },
    {
      id: "10",
      name: "Chris R.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chris",
      isRaisingHand: false
    },
    {
      id: "11",
      name: "Amy L.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amy",
      isRaisingHand: false
    }
  ]
};

const Room = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(true);
  const [isRaisingHand, setIsRaisingHand] = useState(false);
  const [isAdmin] = useState(true);
  const { isUserLoading } = useAuthGuard();

  const handleLeave = () => {
    router.push("/rooms");
  };

  if (isUserLoading) {
    <Loader />;
  }

  return (
    <div className="relative min-h-screen pt-20 pb-32">
      <FloatingOrbs />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </span>
                <span className="text-muted-foreground text-sm">
                  {mockRoom.topic}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {mockRoom.name}
              </h1>
              <p className="text-muted-foreground">{mockRoom.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Room Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-primary" />
              <span>{mockRoom.speakers.length} speakers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{mockRoom.listeners.length} listeners</span>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Speakers
            </h2>
            <div className="flex items-center gap-2">
              <AudioWave isActive size="sm" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-8 justify-center">
              {mockRoom.speakers.map((speaker) => (
                <ParticipantAvatar
                  key={speaker.id}
                  name={speaker.name}
                  avatar={speaker.avatar}
                  isSpeaking={speaker.isSpeaking}
                  isMuted={speaker.isMuted}
                  isAdmin={speaker.isAdmin}
                  size="lg"
                />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              Listeners
            </h2>
            {isAdmin && (
              <Button variant="glass" size="sm" className="text-xs">
                View Raised Hands (
                {mockRoom.listeners.filter((l) => l.isRaisingHand).length})
              </Button>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-6 justify-start">
              {mockRoom.listeners.map((listener) => (
                <ParticipantAvatar
                  key={listener.id}
                  name={listener.name}
                  avatar={listener.avatar}
                  isRaisingHand={listener.isRaisingHand}
                  isMuted
                  size="md"
                />
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 glass border-t border-border/30"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleLeave}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant={isRaisingHand ? "default" : "glass"}
                size="icon"
                onClick={() => setIsRaisingHand(!isRaisingHand)}
                className="w-12 h-12"
              >
                <Hand
                  className={`w-5 h-5 ${isRaisingHand ? "animate-bounce" : ""}`}
                />
              </Button>

              <Button
                variant={isMuted ? "glass" : "glow"}
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="w-14 h-14"
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Room;

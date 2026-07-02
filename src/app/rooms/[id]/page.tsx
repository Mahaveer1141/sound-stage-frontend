"use client";

import { useEffect, useState } from "react";
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
import { RoomType } from "@/lib/api/types";
import { roomApi } from "@/lib/api/endpoints/room";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";

const Room = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(true);
  const [isRaisingHand, setIsRaisingHand] = useState(false);
  const [isAdmin] = useState(true);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isUserLoading } = useAuthGuard();
  const { onConnect, subscribe, send } = useWebSocket(`/ws/rooms/${id}`);

  const handleLeave = () => {
    router.push("/rooms");
  };

  const fetchRoom = async () => {
    setIsLoading(true);
    try {
      const res = await roomApi.show(id as string);
      setRoom(res.data);
    } catch (error) {
      toast.error("Failed to fetch room");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    onConnect(() => {
      send("join_room", {});
    });

    subscribe("join_room", () => {
      fetchRoom();
    });

    subscribe("leave_room", () => {
      fetchRoom();
    });

    return () => {
      send("leave_room", {});
    };
  }, []);

  useEffect(() => {
    let pc: RTCPeerConnection | null = null;
    let stopped = false;
    let stream: MediaStream;

    pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80"
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: process.env.NEXT_PUBLIC_TURN_USERNAME,
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: process.env.NEXT_PUBLIC_TURN_USERNAME,
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL
        }
      ]
    });

    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      stream.getTracks().forEach((track) => {
        try {
          pc?.addTrack(track, stream);
        } catch (e) {
          console.warn("Failed to add track", e);
        }
      });

      onConnect(async () => {
        if (!pc) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send("webrtc_offer", pc.localDescription);
      });
    })();

    subscribe("webrtc_offer", async (offer: RTCSessionDescriptionInit) => {
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send("webrtc_answer", answer);
    });

    subscribe("webrtc_answer", async (answer: RTCSessionDescriptionInit) => {
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    subscribe("webrtc_candidate", async (candidate: RTCIceCandidateInit) => {
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        // ignore
      }
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send("webrtc_candidate", event.candidate);
      }
    };

    pc.ontrack = (event) => {
      const audioElement = document.createElement("audio");
      audioElement.srcObject = new MediaStream([event.track]);
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
    };

    // cleanup on unmount
    return () => {
      stopped = true;
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      try {
        pc?.close();
      } catch (e) {}
    };
  }, []);

  if (isUserLoading || isLoading) {
    return <Loader />;
  }

  if (!room) {
    return "No Room";
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
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {room.name}
              </h1>
              <p className="text-muted-foreground">{room.description}</p>
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
              <span>1 speakers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{room.users?.length} listeners</span>
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
              <ParticipantAvatar
                key={room.creator.id}
                name={room.creator.firstName}
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
                isSpeaking={true}
                isMuted={false}
                isAdmin={true}
                size="lg"
              />
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
                View Raised Hands ({room.users?.filter((_) => false).length})
              </Button>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-6 justify-start">
              {room.users?.map((listener) => (
                <ParticipantAvatar
                  key={listener.id}
                  name={listener.firstName}
                  avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
                  isRaisingHand={false}
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

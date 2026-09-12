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
import { ApiError } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import Loader from "@/components/loader";
import RaisedHandsDialog from "@/components/raised-hands-dialog";
import {
  RoomType,
  RoomUserRole,
  RoomUserType,
  WsErrorPayloadType
} from "@/lib/api/types";
import { roomApi } from "@/lib/api/endpoints/room";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import RemoteAudio from "@/components/remote-audio";
import { useRoomUsers } from "@/hooks/useRoomUsers";

const Room = () => {
  const { isUserLoading } = useAuthGuard();

  const { id } = useParams();

  const router = useRouter();

  const [isRaisingHand, setIsRaisingHand] = useState(false);
  const [raisedHandsCount, setRaisedHandsCount] = useState(0);
  const [isRaisedHandsOpen, setIsRaisedHandsOpen] = useState(false);
  const [raisedHandsVersion, setRaisedHandsVersion] = useState(0);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  const [currentRoomUser, setCurrentRoomUser] = useState<RoomUserType | null>(
    null
  );
  const [isCurrentRoomUserLoading, setIsCurrentRoomUserLoading] =
    useState(false);

  const { onConnect, subscribe, send, isConnected } = useWebSocket(
    `/ws/rooms/${id}`,
    hasJoined
  );

  const {
    users: speakers,
    isLoading: isSpeakersLoading,
    count: speakerCount,
    refetch: refetchSpeakers
  } = useRoomUsers({
    roomId: id as string,
    roles: ["admin", "speaker", "moderator", "owner"],
    isOnline: true,
    pageSize: 10,
    enabled: hasJoined
  });
  const {
    users: listeners,
    isLoading: isListenersLoading,
    count: listenerCount,
    refetch: refetchListeners
  } = useRoomUsers({
    roomId: id as string,
    roles: ["listener"],
    isOnline: true,
    pageSize: 20,
    enabled: hasJoined
  });
  const { isMuted, toggleMute, remoteStream } = useWebRTC({
    send,
    subscribe,
    enabled: isConnected,
    canSpeak: currentRoomUser?.canSpeak
  });

  const handleLeave = () => {
    router.push("/rooms");
  };

  const fetchRoom = async (): Promise<RoomType | null> => {
    setIsRoomLoading(true);
    try {
      const res = await roomApi.show(id as string);
      setRoom(res.data);
      return res.data;
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to fetch room"
      );
      router.push("/rooms");
    } finally {
      setIsRoomLoading(false);
    }
    return null;
  };

  const fetchCurrentRoomUser = async (): Promise<RoomUserType | null> => {
    setIsCurrentRoomUserLoading(true);
    try {
      const res = await roomApi.currentRoomUser(id as string);
      setCurrentRoomUser(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
    } finally {
      setIsCurrentRoomUserLoading(false);
    }
    return null;
  };

  const updateUserRole = async (userId: number, role: RoomUserRole) => {
    try {
      await roomApi.updateUserRole(id as string, userId, role);
    } catch (_) {
      toast.error("Failed to update user role");
    }
  };

  const joinRoom = async (privateCode = "") => {
    if (!id || isJoining || hasJoined) return;

    setIsJoining(true);
    try {
      await roomApi.join(id as string, privateCode);
      await fetchCurrentRoomUser();
      setHasJoined(true);
      setIsJoinModalOpen(false);
      setJoinCode("");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Failed to join room";
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    (async () => {
      const room = await fetchRoom();
      const currentUser = await fetchCurrentRoomUser();
      if (room?.type === "private" && !currentUser) {
        setIsJoinModalOpen(true);
        return;
      }

      void joinRoom();
    })();
  }, []);

  useEffect(() => {
    if (!hasJoined) return;

    onConnect(() => {
      send("join_room", {});
    });
  }, [hasJoined]);

  useEffect(() => {
    if (!hasJoined || !id) return;

    const fetchRaisedHandsCount = async () => {
      try {
        const res = await roomApi.raisedHandsList(id as string, {
          page: 1,
          pageSize: 1
        });
        setRaisedHandsCount(res.pagination.totalCount);
      } catch {
        toast.error("Failed to fetch raised hands");
      }
    };

    void fetchRaisedHandsCount();
  }, [hasJoined]);

  useEffect(() => {
    subscribe<WsErrorPayloadType>("error", (ws_error: WsErrorPayloadType) => {
      console.error("Ws Error: ", ws_error);
    });

    subscribe("join_room", () => {
      refetchListeners();
      refetchSpeakers();
    });

    subscribe("leave_room", () => {
      refetchListeners();
      refetchSpeakers();
    });

    subscribe<{ userId: number; role: RoomUserRole }>(
      "user_role_updated",
      (_) => {
        refetchListeners();
        refetchSpeakers();
        fetchCurrentRoomUser();
      }
    );

    subscribe<{ userId: number; isHandRaised: boolean }>(
      "set_hand_raised",
      (state) => {
        setRaisedHandsVersion((v) => v + 1);
        setRaisedHandsCount((c) =>
          Math.max(0, c + (state.isHandRaised ? 1 : -1))
        );
      }
    );

    return () => {
      if (!isConnected) return;
      send("leave_room", {});
    };
  }, []);

  if (
    isUserLoading ||
    isRoomLoading ||
    isSpeakersLoading ||
    isListenersLoading ||
    isCurrentRoomUserLoading
  ) {
    return <Loader />;
  }

  if (!room) {
    return "No Room";
  }

  return (
    <div className="relative min-h-screen pt-20 pb-32">
      <FloatingOrbs />
      <RemoteAudio stream={remoteStream} />

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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-primary" />
              <span>{speakerCount} Speakers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{listenerCount} Listeners</span>
            </div>
            <Button
              variant="glass"
              size="xs"
              className="hover:cursor-pointer"
              onClick={() => router.push(`/rooms/${id}/users`)}
            >
              View all ({room.totalUsers ?? speakerCount + listenerCount})
            </Button>
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
              {speakers.map((speaker) => (
                <ParticipantAvatar
                  key={speaker.id}
                  currentRoomUser={currentRoomUser}
                  onRoleUpdate={(role: RoomUserRole) =>
                    updateUserRole(speaker.user.id, role)
                  }
                  roomUser={speaker}
                  isMuted={false}
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
            <Button
              variant="glass"
              size="sm"
              className="text-xs hover:cursor-pointer"
              onClick={() => setIsRaisedHandsOpen(true)}
            >
              View Raised Hands ({raisedHandsCount})
            </Button>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-6 justify-start">
              {listeners?.map((listener) => (
                <ParticipantAvatar
                  key={listener.id}
                  currentRoomUser={currentRoomUser}
                  onRoleUpdate={(role: RoomUserRole) =>
                    updateUserRole(listener.user.id, role)
                  }
                  roomUser={listener}
                  isMuted={false}
                  size="lg"
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
                onClick={() => {
                  const next = !isRaisingHand;
                  setIsRaisingHand(next);
                  send("set_hand_raised", { isHandRaised: next });
                }}
                className="w-12 h-12"
              >
                <Hand
                  className={`w-5 h-5 ${isRaisingHand ? "animate-bounce" : ""}`}
                />
              </Button>

              <Button
                variant={isMuted ? "glass" : "glow"}
                size="icon"
                onClick={() => toggleMute()}
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

      <RaisedHandsDialog
        roomId={id as string}
        raisedHandCount={raisedHandsCount}
        currentRoomUser={currentRoomUser}
        onPromote={(userId) => {
          void updateUserRole(userId, "speaker");
          setRaisedHandsVersion((v) => v + 1);
        }}
        open={isRaisedHandsOpen}
        onOpenChange={setIsRaisedHandsOpen}
        onTotalCount={setRaisedHandsCount}
        refreshKey={raisedHandsVersion}
      />

      <Dialog
        open={isJoinModalOpen}
        onOpenChange={(open) => {
          setIsJoinModalOpen(open);
          if (!open && !currentRoomUser) {
            router.push("/rooms");
          }
        }}
      >
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Private Room</DialogTitle>
            <DialogDescription>
              {room.name} requires an invite code to join. Enter the 8-character
              code.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <InputOTP
              maxLength={8}
              value={joinCode}
              onChange={(value) => {
                setJoinCode(value.toUpperCase());
              }}
              onComplete={(value) => joinRoom(value.toUpperCase())}
              disabled={isJoining}
            >
              <InputOTPGroup>
                {Array.from({ length: 8 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-11 w-11 text-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="hover:cursor-pointer"
              variant="glass"
              onClick={() => router.push("/rooms")}
            >
              Cancel
            </Button>
            <Button
              className="hover:cursor-pointer"
              type="button"
              variant="glow"
              disabled={joinCode.length !== 8 || isJoining}
              onClick={() => joinRoom(joinCode)}
            >
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Room;

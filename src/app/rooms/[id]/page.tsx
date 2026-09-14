"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ParticipantAvatar from "@/components/participant-avatar";
import AudioWave from "@/components/audio-wave";
import FloatingOrbs from "@/components/floating-orbs";
import {
  Mic,
  MicOff,
  Hand,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Users,
  Share2,
  SquarePen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthGuard } from "@/hooks/useAuthGuard";
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
import RaisedHandsDrawer from "@/components/raised-hands-drawer";
import RoomUsersDrawer from "@/components/room-users-drawer";
import ChatPanel from "@/components/chat-panel";
import { RoomUserRole, WsErrorPayloadType } from "@/lib/api/types";
import { roomApi } from "@/lib/api/endpoints/room";
import { ApiError } from "@/lib/api";
import { DEFAULT_ROOM_LOGO } from "@/lib/constants";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import RemoteAudio from "@/components/remote-audio";
import { useRoomUsers } from "@/hooks/useRoomUsers";
import useRoomStore from "@/store/useRoomStore";
import useConnectionStore from "@/store/useConnectionStore";
import { useShallow } from "zustand/react/shallow";

const Room = () => {
  const { isUserLoading } = useAuthGuard();

  const { id } = useParams();

  const router = useRouter();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);

  const {
    room,
    currentRoomUser,
    hasJoined,
    isRoomLoading,
    isCurrentRoomUserLoading,
    isRaisingHand,
    raisedHandsCount,
    fetchRoom,
    fetchCurrentRoomUser,
    fetchRaisedHandsCount,
    joinRoom,
    setRaisingHand,
    applyHandRaisedEvent,
    setRaisedHandsOpen,
    setUsersDrawerOpen,
    setChatOpen,
    reset
  } = useRoomStore(
    useShallow((s) => ({
      room: s.room,
      currentRoomUser: s.currentRoomUser,
      hasJoined: s.hasJoined,
      isRoomLoading: s.isRoomLoading,
      isCurrentRoomUserLoading: s.isCurrentRoomUserLoading,
      isRaisingHand: s.isRaisingHand,
      raisedHandsCount: s.raisedHandsCount,
      fetchRoom: s.fetchRoom,
      fetchCurrentRoomUser: s.fetchCurrentRoomUser,
      fetchRaisedHandsCount: s.fetchRaisedHandsCount,
      joinRoom: s.joinRoom,
      setRaisingHand: s.setRaisingHand,
      applyHandRaisedEvent: s.applyHandRaisedEvent,
      setRaisedHandsOpen: s.setRaisedHandsOpen,
      setUsersDrawerOpen: s.setUsersDrawerOpen,
      setChatOpen: s.setChatOpen,
      reset: s.reset
    }))
  );

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

  const handleLeavePermanently = async () => {
    if (!currentRoomUser || isLeavingRoom) return;

    setIsLeavingRoom(true);
    try {
      await roomApi.deleteUser(id as string, currentRoomUser.user.id);
      toast.success("You have left the room");
      router.push("/rooms");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to leave room"
      );
      setIsLeavingRoom(false);
    }
  };

  const handleJoinRoom = async (privateCode = "") => {
    if (!id || isJoining || hasJoined) return;

    setIsJoining(true);
    const joined = await joinRoom(id as string, privateCode);
    setIsJoining(false);

    if (joined) {
      setIsJoinModalOpen(false);
      setJoinCode("");
    }
  };

  useEffect(() => {
    (async () => {
      const room = await fetchRoom(id as string);
      if (!room) {
        router.push("/rooms");
        return;
      }

      const currentUser = await fetchCurrentRoomUser(id as string);
      if (room.type === "private" && !currentUser) {
        setIsJoinModalOpen(true);
        return;
      }

      void joinRoom(id as string);
    })();

    return () => reset();
  }, [id]);

  useEffect(() => {
    if (!hasJoined) return;

    onConnect(() => {
      send("join_room", {});
    });
  }, [hasJoined]);

  useEffect(() => {
    if (!hasJoined || !id) return;

    void fetchRaisedHandsCount(id as string);
  }, [hasJoined, id]);

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
        fetchCurrentRoomUser(id as string, true);
      }
    );

    subscribe<{ userId: number; isHandRaised: boolean }>(
      "set_hand_raised",
      (state) => {
        applyHandRaisedEvent(state.isHandRaised);
      }
    );

    return () => {
      if (!useConnectionStore.getState().isConnected) return;
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
            <div className="flex-1 flex items-start gap-4 min-w-0">
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-border shrink-0">
                <Image
                  src={room.logoImage?.url || DEFAULT_ROOM_LOGO}
                  alt={`${room.name} logo`}
                  fill
                  sizes="(min-width: 768px) 56px, 48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
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
            </div>
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              {currentRoomUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="glass" size="icon">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass">
                    {currentRoomUser.isAdmin && (
                      <Link href={`/rooms/${id}/edit`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <SquarePen className="w-4 h-4 mr-2" />
                          Update Stage
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {currentRoomUser.isAdmin && !currentRoomUser.isOwner && (
                      <DropdownMenuSeparator />
                    )}
                    {!currentRoomUser.isOwner && (
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onSelect={() => setIsLeaveDialogOpen(true)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave Permanently
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              onClick={() => setUsersDrawerOpen(true)}
            >
              View all ({room.totalUsers ?? speakerCount + listenerCount})
            </Button>
            <Button
              variant="glass"
              size="xs"
              className="hover:cursor-pointer"
              onClick={() => setRaisedHandsOpen(true)}
            >
              View Raised Hands ({raisedHandsCount})
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
                  roomUser={speaker}
                  isMuted={
                    speaker.user.id === currentRoomUser?.user.id
                      ? isMuted
                      : false
                  }
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
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-muted-foreground" />
            Listeners
          </h2>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-6 justify-start">
              {listeners?.map((listener) => (
                <ParticipantAvatar
                  key={listener.id}
                  roomUser={listener}
                  isMuted={
                    listener.user.id === currentRoomUser?.user.id
                      ? isMuted
                      : false
                  }
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
                  setRaisingHand(next);
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
            <div className="flex items-center justify-end w-20">
              {room.isChatEnabled && (
                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => setChatOpen(true)}
                  className="w-12 h-12 hover:cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <RoomUsersDrawer roomId={id as string} />

      <ChatPanel roomId={id as string} />

      <RaisedHandsDrawer roomId={id as string} />

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
              containerClassName="w-full"
              value={joinCode}
              onChange={(value) => {
                setJoinCode(value.toUpperCase());
              }}
              onComplete={(value) => handleJoinRoom(value.toUpperCase())}
              disabled={isJoining}
            >
              <InputOTPGroup className="w-full justify-center">
                {Array.from({ length: 8 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="aspect-square h-auto w-full max-w-11 text-lg"
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
              onClick={() => handleJoinRoom(joinCode)}
            >
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Leave Room Permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave {room.name}? You will be removed
              from the room and will need to join again to come back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="hover:cursor-pointer"
              onClick={() => setIsLeaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="hover:cursor-pointer"
              disabled={isLeavingRoom}
              onClick={handleLeavePermanently}
            >
              {isLeavingRoom ? "Leaving..." : "Leave Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Room;

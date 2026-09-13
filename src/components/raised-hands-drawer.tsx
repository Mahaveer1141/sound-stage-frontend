"use client";

import Image from "next/image";
import { Hand, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Spinner } from "@/components/ui/spinner";
import { roomApi } from "@/lib/api/endpoints/room";
import { DEFAULT_USER_AVATAR, ROLE_ICONS } from "@/lib/constants";
import type { RoomUserRole, RoomUserType } from "@/lib/api/types";
import useRoomStore from "@/store/useRoomStore";
import { useShallow } from "zustand/react/shallow";

interface RaisedHandsDrawerProps {
  roomId: string;
}

const RaisedHandsDrawer = ({ roomId }: RaisedHandsDrawerProps) => {
  const {
    isRaisedHandsOpen: open,
    setRaisedHandsOpen: onOpenChange,
    raisedHandsCount: raisedHandCount,
    raisedHandsVersion: refreshKey,
    currentRoomUser,
    promoteToSpeaker,
    setRaisedHandsCount
  } = useRoomStore(
    useShallow((s) => ({
      isRaisedHandsOpen: s.isRaisedHandsOpen,
      setRaisedHandsOpen: s.setRaisedHandsOpen,
      raisedHandsCount: s.raisedHandsCount,
      raisedHandsVersion: s.raisedHandsVersion,
      currentRoomUser: s.currentRoomUser,
      promoteToSpeaker: s.promoteToSpeaker,
      setRaisedHandsCount: s.setRaisedHandsCount
    }))
  );

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass border-l border-border/50 data-[vaul-drawer-direction=right]:w-1/2 data-[vaul-drawer-direction=right]:min-w-75 data-[vaul-drawer-direction=right]:sm:max-w-none">
        <DrawerHeader className="flex-row items-center justify-between border-b border-border/50 p-6">
          <DrawerTitle className="text-xl font-bold flex items-center gap-2">
            <Hand className="w-5 h-5 text-primary" />
            Raised Hands ({raisedHandCount})
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 min-h-0 px-6">
          <InfiniteScroll<RoomUserType>
            key={refreshKey}
            fetcher={(page, pageSize, _params, signal) =>
              roomApi.raisedHandsList(roomId, { page, pageSize }, signal)
            }
            pageSize={20}
            useWindowScroll={false}
            style={{ height: "100%" }}
            className="divide-y divide-border/50"
            onTotalCount={setRaisedHandsCount}
            loader={
              <div className="flex justify-center py-16">
                <Spinner className="size-8" />
              </div>
            }
            emptyPlaceholder={
              <p className="py-12 text-center text-sm text-muted-foreground">
                No raised hands
              </p>
            }
          >
            {(roomUser, index) => {
              const RoleIcon = ROLE_ICONS[roomUser.role.name as RoomUserRole];
              return (
                <div className="flex items-center gap-3 py-3 px-1">
                  <span className="text-sm text-muted-foreground shrink-0">
                    {index + 1}.
                  </span>
                  <Image
                    src={
                      roomUser.user.profilePicture?.url || DEFAULT_USER_AVATAR
                    }
                    alt={roomUser.user.fullName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1.5">
                      {roomUser.user.fullName}
                      {RoleIcon && (
                        <RoleIcon className="w-3.5 h-3.5 text-primary" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {roomUser.role.name}
                    </p>
                  </div>
                  {currentRoomUser?.canManage &&
                    roomUser.role.name === "listener" && (
                      <Button
                        variant="glow"
                        size="xs"
                        className="hover:cursor-pointer shrink-0"
                        onClick={() =>
                          promoteToSpeaker(roomId, roomUser.user.id)
                        }
                      >
                        Invite to Speak
                      </Button>
                    )}
                  <Hand className="w-4 h-4 text-primary shrink-0" />
                </div>
              );
            }}
          </InfiniteScroll>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RaisedHandsDrawer;

"use client";

import { Hand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Spinner } from "@/components/ui/spinner";
import { roomApi } from "@/lib/api/endpoints/room";
import { DEFAULT_USER_AVATAR, ROLE_ICONS } from "@/lib/constants";
import type { RoomUserRole, RoomUserType } from "@/lib/api/types";

interface RaisedHandsDialogProps {
  roomId: string;
  open: boolean;
  raisedHandCount: number;
  currentRoomUser: RoomUserType | null;
  onPromote: (userId: number) => void;
  onOpenChange: (open: boolean) => void;
  onTotalCount?: (count: number) => void;
  refreshKey?: number;
}

const RaisedHandsDialog = ({
  roomId,
  open,
  raisedHandCount,
  currentRoomUser,
  onPromote,
  onOpenChange,
  onTotalCount,
  refreshKey
}: RaisedHandsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hand className="w-5 h-5 text-primary" />
            Raised Hands ({raisedHandCount})
          </DialogTitle>
        </DialogHeader>

        <InfiniteScroll<RoomUserType>
          key={refreshKey}
          fetcher={(page, pageSize, _params, signal) =>
            roomApi.raisedHandsList(roomId, { page, pageSize }, signal)
          }
          pageSize={20}
          useWindowScroll={false}
          style={{ height: "24rem" }}
          className="divide-y divide-border/50"
          onTotalCount={onTotalCount}
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
                <img
                  src={roomUser.user.profilePicture?.url || DEFAULT_USER_AVATAR}
                  alt={roomUser.user.fullName}
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
                      onClick={() => onPromote(roomUser.user.id)}
                    >
                      Invite to Speak
                    </Button>
                  )}
                <Hand className="w-4 h-4 text-primary shrink-0" />
              </div>
            );
          }}
        </InfiniteScroll>
      </DialogContent>
    </Dialog>
  );
};

export default RaisedHandsDialog;

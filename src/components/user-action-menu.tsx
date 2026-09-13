import { RoomUserType, RoomUserRole } from "@/lib/api/types";
import { ROLE_DESCRIPTIONS } from "@/lib/constants";
import { capitalize } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";

interface UserActionsMenuProps {
  roomUser: RoomUserType;
  currentRoomUser: RoomUserType | null;
  onAction: (action: UserAction) => void;
}

type UserActionType = "role" | "kick" | "block" | "mute";

export type UserAction =
  | { type: "role"; role: RoomUserRole }
  | { type: "kick" }
  | { type: "block" }
  | { type: "mute" };

const USER_ACTIONS: { label: string; value: UserActionType }[] = [
  {
    label: "Update Role",
    value: "role"
  },
  {
    label: "Kick Out",
    value: "kick"
  },
  {
    label: "Block",
    value: "block"
  },
  {
    label: "Mute",
    value: "mute"
  }
];

const CAN_MODERATE: Record<RoomUserRole, RoomUserRole[]> = {
  owner: ["admin", "moderator", "speaker", "listener"],
  admin: ["moderator", "speaker", "listener"],
  moderator: ["speaker", "listener"],
  speaker: [],
  listener: []
};

function canPerformAction(
  roomUser: RoomUserType,
  currentRoomUser: RoomUserType | null,
  action: UserActionType
): boolean {
  const actorRole = currentRoomUser?.role.name as RoomUserRole | undefined;
  const targetRole = roomUser.role.name as RoomUserRole;

  if (!actorRole || currentRoomUser?.id === roomUser.id) return false;

  switch (action) {
    case "role":
    case "kick":
      return CAN_MODERATE[actorRole].includes(targetRole);
    case "mute":
      return (
        targetRole !== "listener" &&
        CAN_MODERATE[actorRole].includes(targetRole)
      );
    case "block":
      return actorRole === "owner" || actorRole === "admin";
    default:
      return false;
  }
}

const UserActionDialog = ({
  action,
  roomUser,
  assignableRoles,
  onAction,
  onClose
}: {
  action: UserActionType;
  roomUser: RoomUserType;
  assignableRoles: RoomUserRole[];
  onAction: (action: UserAction) => void;
  onClose: () => void;
}) => {
  const [role, setRole] = useState<RoomUserRole>(
    roomUser.role.name as RoomUserRole
  );

  const label = USER_ACTIONS.find((a) => a.value === action)!.label;
  const currentRole = roomUser.role.name as RoomUserRole;

  const handleConfirm = () => {
    if (action === "role") {
      onAction({ type: "role", role });
    } else {
      onAction({ type: action });
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        {action === "role" ? (
          <div className="flex flex-col gap-2">
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RoomUserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="glass">
                {assignableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {capitalize(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogDescription>{ROLE_DESCRIPTIONS[role]}</DialogDescription>
          </div>
        ) : (
          <DialogDescription>
            Are you sure you want to {label.toLowerCase()}{" "}
            {roomUser.user.fullName}?
          </DialogDescription>
        )}
        <DialogFooter>
          <Button
            variant="ghost"
            className="hover:cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="hover:cursor-pointer"
            disabled={action === "role" && role === currentRole}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserActionsMenu = ({
  roomUser,
  currentRoomUser,
  onAction
}: UserActionsMenuProps) => {
  const [activeAction, setActiveAction] = useState<UserActionType | null>(null);

  const actorRole = currentRoomUser?.role.name as RoomUserRole | undefined;
  const allowedActions = USER_ACTIONS.filter((action) =>
    canPerformAction(roomUser, currentRoomUser, action.value)
  );

  if (allowedActions.length === 0) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:cursor-pointer shrink-0"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass">
          {allowedActions.map((action, index) => (
            <div key={action.value}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setActiveAction(action.value)}
              >
                {action.label}
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {activeAction && (
        <UserActionDialog
          action={activeAction}
          roomUser={roomUser}
          assignableRoles={actorRole ? CAN_MODERATE[actorRole] : []}
          onAction={onAction}
          onClose={() => setActiveAction(null)}
        />
      )}
    </>
  );
};

export default UserActionsMenu;

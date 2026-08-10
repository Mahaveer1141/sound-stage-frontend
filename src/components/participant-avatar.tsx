import { motion } from "framer-motion";
import { Mic, MicOff, Crown, Hand, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { RoomUserRole, RoomUserType } from "@/lib/api/types";

interface RoleAction {
  label: string;
  role: RoomUserRole;
  haveRole: (user: RoomUserType) => boolean;
}

const ROLE_ACTIONS: RoleAction[] = [
  {
    label: "Invite to Speak",
    role: "speaker",
    haveRole: (user: RoomUserType) => user.canManage
  },
  {
    label: "Make Host",
    role: "admin",
    haveRole: (user: RoomUserType) => user.isAdmin
  },
  {
    label: "Make Moderator",
    role: "moderator",
    haveRole: (user: RoomUserType) => user.isAdmin
  },
  {
    label: "Move to Listeners",
    role: "listener",
    haveRole: (user: RoomUserType) => user.canManage
  }
];

interface ParticipantAvatarProps {
  size?: "sm" | "md" | "lg";
  roomUser: RoomUserType;
  currentRoomUser: RoomUserType | null;
  isMuted?: boolean;
  onRoleUpdate: (role: RoomUserRole) => Promise<void>;
  isRaisingHand?: boolean;
  onMuteToggle?: () => void;
}

const ParticipantAvatar = ({
  size = "md",
  roomUser,
  currentRoomUser,
  onRoleUpdate,
  isMuted = true,
  isRaisingHand = false,
  onMuteToggle
}: ParticipantAvatarProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };
  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const avatar =
    roomUser.user.profilePicture ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=alex";
  const isSpeaking = !isMuted;

  const canManageUser = () => {
    if (currentRoomUser?.id === roomUser.id) return false;
    if (currentRoomUser?.isAdmin) return true;
    if (currentRoomUser?.canManage)
      return (
        roomUser.role.name === "speaker" || roomUser.role.name === "listener"
      );
    return false;
  };

  const avatarCircle = (
    <div className="relative">
      {isSpeaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-secondary"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
        </>
      )}

      <div
        className={cn(
          "rounded-full overflow-hidden border-2 transition-all duration-300 relative",
          sizeClasses[size],
          isSpeaking
            ? "border-primary glow-sm"
            : "border-border group-hover:border-primary/50"
        )}
      >
        <img
          src={avatar}
          alt={roomUser.user.fullName}
          className="w-full h-full object-cover"
        />

        {canManageUser() && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full",
              "bg-black/50 opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200"
            )}
          >
            <ChevronDown className={cn("text-white", iconSize[size])} />
          </div>
        )}
      </div>

      {roomUser?.isAdmin && (
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-linear-to-r from-primary to-secondary">
          <Crown className={cn("text-primary-foreground", iconSize[size])} />
        </div>
      )}

      <div
        className={cn(
          "absolute -bottom-1 -right-1 p-1.5 rounded-full transition-all duration-300",
          isMuted ? "bg-destructive/80" : isSpeaking ? "bg-primary" : "bg-muted"
        )}
      >
        {isMuted ? (
          <MicOff
            className={cn("text-destructive-foreground", iconSize[size])}
          />
        ) : (
          <Mic className={cn("text-foreground", iconSize[size])} />
        )}
      </div>

      {isRaisingHand && (
        <motion.div
          className="absolute -top-2 -left-2 p-1.5 rounded-full bg-accent"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <Hand className={cn("text-accent-foreground", iconSize[size])} />
        </motion.div>
      )}
    </div>
  );

  return (
    <motion.div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {canManageUser() ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              {avatarCircle}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {ROLE_ACTIONS.map((action) => {
              if (
                action.haveRole(currentRoomUser!) &&
                action.role !== roomUser.role.name
              ) {
                return (
                  <DropdownMenuItem
                    key={action.label}
                    onClick={() => onRoleUpdate(action.role)}
                  >
                    {action.label}
                  </DropdownMenuItem>
                );
              }
              return null;
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onMuteToggle}>
              {isMuted ? "Unmute" : "Mute"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div>{avatarCircle}</div>
      )}

      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-center max-w-20 truncate">
        {roomUser.user.firstName}
      </span>
    </motion.div>
  );
};

export default ParticipantAvatar;

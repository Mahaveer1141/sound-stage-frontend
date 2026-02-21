import { motion } from "framer-motion";
import { Mic, MicOff, Crown, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantAvatarProps {
  name: string;
  avatar: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isAdmin?: boolean;
  isRaisingHand?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const ParticipantAvatar = ({
  name,
  avatar,
  isSpeaking = false,
  isMuted = false,
  isAdmin = false,
  isRaisingHand = false,
  size = "md",
  onClick
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

  return (
    <motion.div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="relative">
        {isSpeaking && !isMuted && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 0, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-secondary"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6]
              }}
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
            "rounded-full overflow-hidden border-2 transition-all duration-300",
            sizeClasses[size],
            isSpeaking && !isMuted
              ? "border-primary glow-sm"
              : "border-border group-hover:border-primary/50"
          )}
        >
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>

        {isAdmin && (
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-r from-primary to-secondary">
            <Crown className={cn("text-primary-foreground", iconSize[size])} />
          </div>
        )}

        <div
          className={cn(
            "absolute -bottom-1 -right-1 p-1.5 rounded-full transition-all duration-300",
            isMuted
              ? "bg-destructive/80"
              : isSpeaking
                ? "bg-primary"
                : "bg-muted"
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

      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-center max-w-[80px] truncate">
        {name}
      </span>
    </motion.div>
  );
};

export default ParticipantAvatar;

import {
  Crown,
  MicVocal,
  Shield,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";
import type { FilterOption } from "@/components/filter-dropdown";
import type { RoomUserRole } from "@/lib/api/types";

export const DEFAULT_USER_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=alex";

export const DEFAULT_ROOM_COVER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
export const DEFAULT_ROOM_LOGO =
  "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";

export const BOOLEAN_OPTIONS: FilterOption[] = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" }
];

export const DEFAULT_PAGE = 1;

export const ALL_ROLES: RoomUserRole[] = [
  "owner",
  "admin",
  "speaker",
  "moderator",
  "listener"
];

export const ROLE_ICONS: Partial<Record<RoomUserRole, LucideIcon>> = {
  owner: Crown,
  admin: ShieldCheck,
  moderator: Shield,
  speaker: MicVocal
};

export const ROLE_DESCRIPTIONS: Record<RoomUserRole, string> = {
  owner: "Full control over the room, including managing admins and settings.",
  admin: "Can manage moderators, speakers and listeners, and block users.",
  moderator: "Can manage speakers and listeners, and mute speakers.",
  speaker: "Can speak on stage and participate in the discussion.",
  listener: "Can listen to the room and raise a hand to request speaking."
};

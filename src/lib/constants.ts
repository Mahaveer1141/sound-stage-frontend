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

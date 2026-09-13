"use client";

import Image from "next/image";
import { useState } from "react";
import { Filter, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  FilterDropdown,
  countActiveFilters,
  type FilterConfig
} from "@/components/filter-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { useRoomUsers } from "@/hooks/useRoomUsers";
import { roomApi } from "@/lib/api/endpoints/room";
import { ApiError } from "@/lib/api";
import { ALL_ROLES, DEFAULT_USER_AVATAR, ROLE_ICONS } from "@/lib/constants";
import { capitalize, cn } from "@/lib/utils";
import { RoomUserRole, RoomUserType, UserType } from "@/lib/api/types";
import UserActionsMenu, { UserAction } from "@/components/user-action-menu";

const USER_FILTERS: FilterConfig[] = [
  {
    key: "roles",
    label: "Role",
    options: ALL_ROLES.map((role) => ({
      value: role,
      label: capitalize(role)
    })),
    multi: true
  },
  {
    key: "isOnline",
    label: "Online",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" }
    ],
    multi: false
  }
];

type Tab = "active" | "blocked";

interface UserRowProps {
  user: UserType;
  subtitle: string;
  role?: RoomUserRole;
  isOnline?: boolean;
  actions?: React.ReactNode;
}

const UserRow = ({ user, subtitle, role, isOnline, actions }: UserRowProps) => {
  const avatar = user.profilePicture?.url || DEFAULT_USER_AVATAR;
  const RoleIcon = role ? ROLE_ICONS[role] : undefined;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative shrink-0">
        <Image
          src={avatar}
          alt={user.fullName}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover border border-border"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {user.fullName}
          {RoleIcon && <RoleIcon className="w-3.5 h-3.5 text-primary" />}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
};

interface RoomUsersDrawerProps {
  roomId: string;
  currentRoomUser: RoomUserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoomUsersDrawer = ({
  roomId,
  currentRoomUser,
  open,
  onOpenChange
}: RoomUsersDrawerProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const roles = (
    selectedFilters.roles?.length ? selectedFilters.roles : ALL_ROLES
  ) as RoomUserRole[];
  const isOnline = selectedFilters.isOnline?.length
    ? selectedFilters.isOnline[0] === "true"
    : undefined;
  const activeFilterCount = countActiveFilters(selectedFilters);

  const {
    users,
    isLoading,
    count,
    page,
    totalPages,
    nextPage,
    prevPage,
    refetch
  } = useRoomUsers({
    roomId,
    roles,
    isOnline,
    query: searchQuery || undefined,
    pageSize: 20,
    enabled: open && activeTab === "active"
  });

  const {
    users: blockedUsers,
    isLoading: isBlockedLoading,
    count: blockedCount,
    page: blockedPage,
    totalPages: blockedTotalPages,
    nextPage: nextBlockedPage,
    prevPage: prevBlockedPage,
    refetch: refetchBlocked
  } = useRoomUsers({
    roomId,
    blocked: true,
    query: activeTab === "blocked" ? searchQuery || undefined : undefined,
    pageSize: 20,
    enabled: open && !!currentRoomUser?.isAdmin
  });

  const handleUserAction = async (
    roomUser: RoomUserType,
    action: UserAction
  ) => {
    try {
      switch (action.type) {
        case "role":
          await roomApi.updateUserRole(roomId, roomUser.user.id, action.role);
          break;
        case "kick":
          await roomApi.deleteUser(roomId, roomUser.user.id);
          break;
        case "block":
          await roomApi.blockUser(roomId, roomUser.user.id);
          break;
        case "mute":
          await roomApi.setUserMuted(roomId, roomUser.user.id);
          break;
      }
      refetch(true);
      refetchBlocked(true);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Action failed");
    }
  };

  const handleUnblock = async (userId: number) => {
    try {
      await roomApi.unblockUser(roomId, userId);
      refetch(true, true);
      refetchBlocked(true);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to unblock user"
      );
    }
  };

  const currentPage = activeTab === "active" ? page : blockedPage;
  const currentTotalPages =
    activeTab === "active" ? totalPages : blockedTotalPages;
  const onPrevPage = activeTab === "active" ? prevPage : prevBlockedPage;
  const onNextPage = activeTab === "active" ? nextPage : nextBlockedPage;

  const filterTrigger = (
    <Button variant="glass" className="gap-2 hover:cursor-pointer">
      <Filter className="w-4 h-4" />
      {activeFilterCount > 0 && (
        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass border-l border-border/50 data-[vaul-drawer-direction=right]:w-1/2 data-[vaul-drawer-direction=right]:min-w-75 data-[vaul-drawer-direction=right]:sm:max-w-none">
        <DrawerHeader className="flex-row items-center justify-between border-b border-border/50 p-6">
          <div>
            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              All Users
            </DrawerTitle>
            <DrawerDescription>
              {activeTab === "active"
                ? `${count} people in this room`
                : `${blockedCount} blocked`}
            </DrawerDescription>
          </div>
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

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as Tab)}
          className="flex-1 min-h-0 gap-0"
        >
          <div className="px-6 border-b border-border/50">
            <TabsList variant="line" className="w-full justify-start gap-6 p-0">
              <TabsTrigger
                value="active"
                className="flex-none hover:cursor-pointer"
              >
                Active ({count})
              </TabsTrigger>
              {currentRoomUser?.isAdmin && (
                <TabsTrigger
                  value="blocked"
                  className="flex-none hover:cursor-pointer"
                >
                  Blocked ({blockedCount})
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex gap-2 px-6 py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground z-10 pointer-events-none" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 glass border-border/50 focus:border-primary"
              />
            </div>
            {activeTab === "active" && (
              <FilterDropdown
                filters={USER_FILTERS}
                value={selectedFilters}
                onChange={setSelectedFilters}
                trigger={filterTrigger}
              />
            )}
          </div>

          <TabsContent
            value="active"
            className="flex-1 min-h-0 overflow-y-auto px-6 pb-6"
          >
            <div className="divide-y divide-border/50">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </p>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No users found
                </p>
              ) : (
                users.map((roomUser) => (
                  <UserRow
                    key={roomUser.id}
                    user={roomUser.user}
                    subtitle={roomUser.role.name}
                    role={roomUser.role.name as RoomUserRole}
                    isOnline={roomUser.isOnline}
                    actions={
                      <UserActionsMenu
                        roomUser={roomUser}
                        currentRoomUser={currentRoomUser}
                        onAction={(action) =>
                          handleUserAction(roomUser, action)
                        }
                      />
                    }
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="blocked"
            className="flex-1 min-h-0 overflow-y-auto px-6 pb-6"
          >
            <div className="divide-y divide-border/50">
              {isBlockedLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </p>
              ) : blockedUsers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No blocked users
                </p>
              ) : (
                blockedUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    subtitle="Blocked"
                    actions={
                      <Button
                        variant="glass"
                        size="xs"
                        className="hover:cursor-pointer shrink-0"
                        onClick={() => handleUnblock(user.id)}
                      >
                        Unblock
                      </Button>
                    }
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {currentTotalPages > 1 && (
          <Pagination className="px-6 py-4 border-t border-border/50 shrink-0">
            <PaginationContent className="w-full justify-between">
              <PaginationItem>
                <PaginationPrevious
                  onClick={onPrevPage}
                  aria-disabled={currentPage <= 1}
                  className={cn(
                    "hover:cursor-pointer",
                    currentPage <= 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {currentTotalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={onNextPage}
                  aria-disabled={currentPage >= currentTotalPages}
                  className={cn(
                    "hover:cursor-pointer",
                    currentPage >= currentTotalPages &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default RoomUsersDrawer;

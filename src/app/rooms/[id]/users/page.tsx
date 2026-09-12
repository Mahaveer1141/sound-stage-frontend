"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Filter, Search, Users } from "lucide-react";
import FloatingOrbs from "@/components/floating-orbs";
import Loader from "@/components/loader";
import {
  FilterDropdown,
  countActiveFilters,
  type FilterConfig
} from "@/components/filter-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRoomUsers } from "@/hooks/useRoomUsers";
import { roomApi } from "@/lib/api/endpoints/room";
import { DEFAULT_USER_AVATAR } from "@/lib/constants";
import { capitalize, cn } from "@/lib/utils";
import { RoomUserRole, RoomUserType, UserType } from "@/lib/api/types";
import { ALL_ROLES } from "@/lib/constants";

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
  isOwner?: boolean;
  isOnline?: boolean;
}

const UserRow = ({
  user,
  subtitle,
  isOwner = false,
  isOnline
}: UserRowProps) => {
  const avatar = user.profilePicture?.url || DEFAULT_USER_AVATAR;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={user.fullName}
          className="w-11 h-11 rounded-full object-cover border border-border"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {user.fullName}
          {isOwner && <Crown className="w-3.5 h-3.5 text-primary" />}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{subtitle}</p>
      </div>
    </div>
  );
};

const RoomUsers = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isUserLoading } = useAuthGuard();

  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [currentRoomUser, setCurrentRoomUser] = useState<RoomUserType | null>(
    null
  );

  const roles = (
    selectedFilters.roles?.length ? selectedFilters.roles : ALL_ROLES
  ) as RoomUserRole[];
  const isOnline = selectedFilters.isOnline?.length
    ? selectedFilters.isOnline[0] === "true"
    : undefined;
  const activeFilterCount = countActiveFilters(selectedFilters);

  const { users, isLoading, count, page, totalPages, nextPage, prevPage } =
    useRoomUsers({
      roomId: id as string,
      roles,
      isOnline,
      query: searchQuery || undefined,
      pageSize: 20,
      enabled: activeTab === "active"
    });

  const {
    users: blockedUsers,
    isLoading: isBlockedLoading,
    count: blockedCount,
    page: blockedPage,
    totalPages: blockedTotalPages,
    nextPage: nextBlockedPage,
    prevPage: prevBlockedPage
  } = useRoomUsers({
    roomId: id as string,
    blocked: true,
    query: activeTab === "blocked" ? searchQuery || undefined : undefined,
    pageSize: 20,
    enabled: !!currentRoomUser?.isAdmin
  });

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await roomApi.currentRoomUser(id as string);
        setCurrentRoomUser(res.data);
      } catch (error) {
        console.error("Failed to fetch current room user:", error);
      }
    })();
  }, []);

  const currentPage = activeTab === "active" ? page : blockedPage;
  const currentTotalPages =
    activeTab === "active" ? totalPages : blockedTotalPages;
  const onPrevPage = activeTab === "active" ? prevPage : prevBlockedPage;
  const onNextPage = activeTab === "active" ? nextPage : nextBlockedPage;

  if (isUserLoading) {
    return <Loader />;
  }

  const filterTrigger = (
    <Button variant="glass" className="gap-2 sm:w-auto">
      <Filter className="w-4 h-4" />
      Filters
      {activeFilterCount > 0 && (
        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4">
      <FloatingOrbs />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            className="hover:cursor-pointer mb-4 -ml-2"
            onClick={() => router.push(`/rooms/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to room
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            All Users
          </h1>
          <p className="text-muted-foreground text-lg">
            {activeTab === "active"
              ? `${count} people in this room`
              : `${blockedCount} blocked`}
          </p>
        </motion.div>

        <div className="flex gap-6 border-b border-border/50 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 transition-colors hover:cursor-pointer -mb-px",
              activeTab === "active"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Active ({count})
          </button>
          {currentRoomUser?.isAdmin && (
            <button
              onClick={() => setActiveTab("blocked")}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-colors hover:cursor-pointer -mb-px",
                activeTab === "blocked"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Blocked ({blockedCount})
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground z-10 pointer-events-none" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass border-border/50 focus:border-primary"
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

          <div className="glass rounded-2xl p-6">
            <div className="divide-y divide-border/50">
              {activeTab === "active" ? (
                isLoading ? (
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
                      isOwner={roomUser.isOwner}
                      isOnline={roomUser.isOnline}
                    />
                  ))
                )
              ) : isBlockedLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </p>
              ) : blockedUsers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No blocked users
                </p>
              ) : (
                blockedUsers.map((user) => (
                  <UserRow key={user.id} user={user} subtitle="Blocked" />
                ))
              )}
            </div>

            {currentTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Button
                  variant="glass"
                  size="sm"
                  className="hover:cursor-pointer"
                  disabled={currentPage <= 1}
                  onClick={onPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {currentTotalPages}
                </span>
                <Button
                  variant="glass"
                  size="sm"
                  className="hover:cursor-pointer"
                  disabled={currentPage >= currentTotalPages}
                  onClick={onNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoomUsers;

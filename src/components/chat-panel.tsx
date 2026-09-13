"use client";

import { useEffect, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import {
  ArrowDown,
  MessageSquare,
  Pin,
  PinOff,
  SendHorizontal,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader
} from "@/components/ui/message";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { roomApi } from "@/lib/api/endpoints/room";
import { ApiError, ws } from "@/lib/api";
import { DEFAULT_USER_AVATAR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ChatMessageType } from "@/lib/api/types";
import useRoomStore from "@/store/useRoomStore";
import { useShallow } from "zustand/react/shallow";

const PAGE_SIZE = 50;
const MAX_PINNED_MESSAGES = 20;
const FIRST_ITEM_INDEX = 100000;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const PinnedRow = ({
  message,
  canUnpin = false,
  onUnpin
}: {
  message: ChatMessageType;
  canUnpin?: boolean;
  onUnpin?: (message: ChatMessageType) => void;
}) => {
  const name = message.user?.fullName ?? "Unknown";

  return (
    <div className="group/pinned flex gap-2 items-start">
      <Avatar className="size-6 shrink-0">
        <AvatarImage
          src={message.user?.profilePicture?.url || DEFAULT_USER_AVATAR}
          alt={name}
        />
        <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium">{name}</span>
        <p className="text-sm text-foreground/90 wrap-break-words line-clamp-2">
          {message.content}
        </p>
      </div>
      {canUnpin && onUnpin && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Unpin message"
              onClick={() => onUnpin(message)}
              className="size-5 shrink-0 hover:cursor-pointer opacity-0 transition-opacity group-hover/pinned:opacity-100"
            >
              <PinOff />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Unpin message</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

interface ChatListContext {
  hasMore: boolean;
  isLoading: boolean;
  onLoadOlder: () => void;
}

const ChatListHeader = ({ context }: { context?: ChatListContext }) => {
  if (!context?.hasMore) return null;

  return (
    <div className="flex justify-center py-2">
      <Button
        variant="glass"
        size="xs"
        className="hover:cursor-pointer"
        disabled={context.isLoading}
        onClick={context.onLoadOlder}
      >
        {context.isLoading ? (
          <Spinner className="size-3" />
        ) : (
          "Load older messages"
        )}
      </Button>
    </div>
  );
};

const MessageRow = ({
  message,
  isOwn,
  canPin = false,
  onTogglePin
}: {
  message: ChatMessageType;
  isOwn: boolean;
  canPin?: boolean;
  onTogglePin?: (message: ChatMessageType) => void;
}) => {
  const name = isOwn ? "You" : (message.user?.fullName ?? "Unknown");

  return (
    <Message align={isOwn ? "end" : "start"}>
      <MessageContent className="gap-1">
        <MessageHeader className="items-center gap-1 px-0">
          <Avatar className="size-6">
            <AvatarImage
              src={message.user?.profilePicture?.url || DEFAULT_USER_AVATAR}
              alt={message.user?.fullName ?? name}
            />
            <AvatarFallback className="text-xs">
              {(message.user?.firstName ?? name).charAt(0)}
            </AvatarFallback>
          </Avatar>
          {name}
          {message.isPinned && <Pin className="w-3 h-3 text-primary" />}
          {canPin && onTogglePin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={
                    message.isPinned ? "Unpin message" : "Pin message"
                  }
                  onClick={() => onTogglePin(message)}
                  className="size-5 hover:cursor-pointer opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100"
                >
                  {message.isPinned ? <PinOff /> : <Pin />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {message.isPinned ? "Unpin message" : "Pin message"}
              </TooltipContent>
            </Tooltip>
          )}
        </MessageHeader>
        <Bubble variant={isOwn ? "default" : "secondary"}>
          <BubbleContent>{message.content}</BubbleContent>
        </Bubble>
        <MessageFooter className="px-0">
          {formatTime(message.createdAt)}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
};

interface ChatPanelProps {
  roomId: string;
}

const ChatPanel = ({ roomId }: ChatPanelProps) => {
  const {
    isChatOpen: open,
    setChatOpen: onOpenChange,
    currentRoomUser
  } = useRoomStore(
    useShallow((s) => ({
      isChatOpen: s.isChatOpen,
      setChatOpen: s.setChatOpen,
      currentRoomUser: s.currentRoomUser
    }))
  );
  const currentUserId = currentRoomUser?.user.id;
  const canPin = currentRoomUser?.isAdmin ?? false;
  const [list, setList] = useState<{
    messages: ChatMessageType[];
    firstItemIndex: number;
  }>({ messages: [], firstItemIndex: FIRST_ITEM_INDEX });
  const { messages, firstItemIndex } = list;
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessageType[]>([]);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [draft, setDraft] = useState("");
  const [pinOnSend, setPinOnSend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isPinLimitReached = pinnedCount >= MAX_PINNED_MESSAGES;

  const loadMessages = async (pageToLoad: number) => {
    setIsLoading(true);
    try {
      const res = await roomApi.messages(roomId, {
        page: pageToLoad,
        pageSize: PAGE_SIZE
      });
      const batch = [...res.data].reverse();
      setList((prev) => {
        if (pageToLoad === 1) {
          return { messages: batch, firstItemIndex: FIRST_ITEM_INDEX };
        }
        const existing = new Set(prev.messages.map((m) => m.id));
        const fresh = batch.filter((m) => !existing.has(m.id));
        return {
          messages: [...fresh, ...prev.messages],
          firstItemIndex: prev.firstItemIndex - fresh.length
        };
      });
      setHasMore(pageToLoad < res.pagination.totalPages);
      setPage(pageToLoad);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to load messages"
      );
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  };

  const loadPinned = async () => {
    try {
      const res = await roomApi.messages(roomId, {
        isPinned: true,
        pageSize: PAGE_SIZE
      });
      setPinnedMessages([...res.data].reverse());
      setPinnedCount(res.pagination.totalCount);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to load pinned messages"
      );
    }
  };

  useEffect(() => {
    if (!open) return;

    setList({ messages: [], firstItemIndex: FIRST_ITEM_INDEX });
    setPage(1);
    setHasMore(false);
    setHasLoadedOnce(false);
    void loadMessages(1);
    void loadPinned();
  }, [open]);

  const handleTogglePin = async (message: ChatMessageType) => {
    try {
      const res = await roomApi.setMessagePinned(
        roomId,
        message.id,
        !message.isPinned
      );
      setList((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === message.id ? { ...m, isPinned: res.data.isPinned } : m
        )
      }));
      await loadPinned();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to update message"
      );
    }
  };

  useEffect(() => {
    if (!open) return;

    return ws.on<ChatMessageType>("chat_message", (message) => {
      setList((prev) =>
        prev.messages.some((m) => m.id === message.id)
          ? prev
          : { ...prev, messages: [...prev.messages, message] }
      );
      if (message.isPinned) void loadPinned();
    });
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const pinned = pinOnSend;
    setDraft("");
    setPinOnSend(false);
    setIsSending(true);
    try {
      const res = await roomApi.createMessage(roomId, {
        content,
        isPinned: pinned
      });
      setList((prev) =>
        prev.messages.some((m) => m.id === res.data.id)
          ? prev
          : { ...prev, messages: [...prev.messages, res.data] }
      );
      if (res.data.isPinned) void loadPinned();
    } catch (error) {
      setDraft(content);
      setPinOnSend(pinned);
      toast.error(
        error instanceof ApiError ? error.message : "Failed to send message"
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass border-l border-border/50 data-[vaul-drawer-direction=right]:w-1/2 data-[vaul-drawer-direction=right]:min-w-75 data-[vaul-drawer-direction=right]:sm:max-w-none">
        <DrawerHeader className="flex-row items-center justify-between border-b border-border/50 p-6">
          <div>
            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Chat
            </DrawerTitle>
            <DrawerDescription>Room messages</DrawerDescription>
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

        {pinnedMessages.length > 0 && (
          <div className="shrink-0 border-b border-border/50 px-6 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Pin className="w-3.5 h-3.5 text-primary" />
              Pinned
            </p>
            <div className="h-28 overflow-y-auto space-y-3 pr-1">
              {pinnedMessages.map((message) => (
                <PinnedRow
                  key={message.id}
                  message={message}
                  canUnpin={canPin}
                  onUnpin={handleTogglePin}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 px-4">
          {!hasLoadedOnce && isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="size-8" />
            </div>
          ) : messages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquare />
                </EmptyMedia>
                <EmptyTitle>No messages yet</EmptyTitle>
                <EmptyDescription>
                  Messages sent in this room will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="relative h-full">
              <Virtuoso<ChatMessageType, ChatListContext>
                ref={virtuosoRef}
                data={messages}
                firstItemIndex={firstItemIndex}
                initialTopMostItemIndex={{ index: "LAST", align: "end" }}
                computeItemKey={(_index, message) => message.id}
                alignToBottom
                followOutput="auto"
                increaseViewportBy={200}
                atBottomStateChange={setIsAtBottom}
                className="h-full scrollbar-thin scroll-fade-b overscroll-contain"
                context={{
                  hasMore,
                  isLoading,
                  onLoadOlder: () => void loadMessages(page + 1)
                }}
                components={{ Header: ChatListHeader }}
                itemContent={(_index, message) => (
                  <div className="px-2 pb-4">
                    <MessageRow
                      message={message}
                      isOwn={message.user?.id === currentUserId}
                      canPin={canPin}
                      onTogglePin={handleTogglePin}
                    />
                  </div>
                )}
              />
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="Scroll to latest message"
                onClick={() =>
                  virtuosoRef.current?.scrollToIndex({
                    index: "LAST",
                    align: "end",
                    behavior: "smooth"
                  })
                }
                className={cn(
                  "absolute inset-s-1/2 -translate-x-1/2 bottom-4 hover:cursor-pointer transition-[translate,scale,opacity] duration-200",
                  !isAtBottom
                    ? "translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none translate-y-full scale-95 opacity-0"
                )}
              >
                <ArrowDown />
              </Button>
            </div>
          )}
        </div>

        <form
          className="px-6 py-4 border-t border-border/50 shrink-0"
          onSubmit={handleSubmit}
        >
          <InputGroup className="glass border-border/50 h-auto">
            {pinOnSend && !isPinLimitReached && (
              <InputGroupAddon align="block-start" className="border-b">
                <InputGroupText className="text-xs">
                  <Pin /> This message will be pinned
                </InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Send a message..."
            />
            <InputGroupAddon align="inline-end">
              {canPin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Pin message on send"
                      aria-pressed={pinOnSend}
                      disabled={isPinLimitReached}
                      onClick={() => setPinOnSend((v) => !v)}
                      className={cn(pinOnSend && "text-primary bg-primary/10")}
                    >
                      <Pin className={cn(pinOnSend && "fill-current")} />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPinLimitReached
                      ? `Pin limit reached (${MAX_PINNED_MESSAGES})`
                      : "Pin message on send"}
                  </TooltipContent>
                </Tooltip>
              )}
              <InputGroupButton
                type="submit"
                size="icon-xs"
                variant="glow"
                aria-label="Send message"
                disabled={!draft.trim() || isSending}
                className="hover:cursor-pointer"
              >
                <SendHorizontal />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatPanel;

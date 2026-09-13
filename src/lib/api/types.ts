export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type QueryValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
}

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiBaseResponse<T = unknown> {
  data: T;
  message: string;
}

export interface ApiPaginatedResponse<T = unknown> extends ApiBaseResponse<T> {
  pagination: {
    page: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

export interface UserType {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture?: FileAttachmentType;
}

export interface FileAttachmentType {
  publicId: string;
  url: string;
}

export interface CategoryType {
  id: number;
  name: string;
  description?: string;
}

export interface TagType {
  id: number;
  name: string;
}

export interface ChatMessageType {
  id: number;
  content: string;
  isPinned: boolean;
  createdAt: string;
  user?: UserType;
}

export type RoomAccessType = "public" | "private";

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  coverImage?: FileAttachmentType;
  logoImage?: FileAttachmentType;
  totalUsers?: number;
  liveUsers?: number;
  type?: RoomAccessType;
  privateCode?: string;
  isRoomUser?: boolean;
  isFavourited?: boolean;
  isChatEnabled?: boolean;
  categories?: CategoryType[];
  tags?: TagType[];
}

export interface RoleType {
  id: number;
  name: string;
  description?: string;
}

export interface RoomUserType {
  id: number;
  user: UserType;
  role: RoleType;
  isOnline: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isAdmin: boolean;
  canManage: boolean;
  canSpeak: boolean;
  isOwner: boolean;
}

export interface SignUpInput {
  email: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string;
}

export interface RoomInput {
  name: string;
  description?: string;
  type?: RoomAccessType;
  isChatEnabled?: boolean;
  categories?: number[];
  tags?: number[];
}

export type RoomUserRole =
  | "owner"
  | "admin"
  | "speaker"
  | "moderator"
  | "listener";

interface Pagination {
  page?: number;
  pageSize?: number;
}

interface Sort {
  field?: string;
  order?: "asc" | "desc";
}

interface SearchQuery {
  query?: string;
}

export interface RoomQuery extends Pagination, SearchQuery, QueryParams {
  categoryIds?: string[];
  tagIds?: string[];
  joined?: boolean;
  live?: boolean;
}

export interface RoomUsersQuery
  extends Pagination, SearchQuery, QueryParams, Sort {
  roles?: RoomUserRole[];
  isOnline?: boolean;
}

export interface ChatMessageQuery extends Pagination, QueryParams {
  isPinned?: boolean;
}

export interface BlockedUsersQuery
  extends Pagination, SearchQuery, QueryParams {}

export interface TagQuery extends Pagination, SearchQuery, QueryParams {}

export type WsMessageHandler<T> = (data: T) => void;
export type WsEventHandler = () => void;
export type WsErrorPayloadType = {
  message: string;
  code: number;
};
export type EventType =
  | "join_room"
  | "leave_room"
  | "webrtc_offer"
  | "webrtc_answer"
  | "webrtc_candidate"
  | "webrtc_add_track"
  | "user_role_updated"
  | "set_hand_raised"
  | "chat_message"
  | "error";

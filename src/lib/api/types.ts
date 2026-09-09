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
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture?: string;
}

export interface FileAttachmentType {
  publicId: string;
  url: string;
}

export interface CategoryType {
  id: string;
  name: string;
  description?: string;
}

export interface TagType {
  id: string;
  name: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  coverImage?: FileAttachmentType;
  logoImage?: FileAttachmentType;
  totalUsers?: number;
  liveUsers?: number;
}

export interface RoleType {
  id: string;
  name: string;
  description?: string;
}

export interface RoomUserType {
  id: string;
  user: UserType;
  role: RoleType;
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
}

export type RoomUserRole =
  | "owner"
  | "admin"
  | "speaker"
  | "moderator"
  | "listener";

interface Pagination {
  page?: number;
  perPage?: number;
}

export interface RoomQuery extends Pagination, QueryParams {
  query?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface RoomUsersQuery extends Pagination, QueryParams {
  roles?: RoomUserRole[];
}

export interface TagQuery extends Pagination, QueryParams {
  query?: string;
}

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
  | "error";

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
    totalItems: number;
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
  profilePicture?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  creator: UserType;
  users?: UserType[];
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

export type RoomUserRole = "admin" | "speaker" | "moderator" | "listener";

export interface RoomUsersQuery {
  roles?: RoomUserRole[];
  page?: number;
  perPage?: number;
}

export type WsMessageHandler<T> = (data: T) => void;
export type WsEventHandler = () => void;
export type EventType =
  | "join_room"
  | "leave_room"
  | "webrtc_offer"
  | "webrtc_answer"
  | "webrtc_candidate"
  | "webrtc_add_track"
  | "user_role_updated"
  | "error";

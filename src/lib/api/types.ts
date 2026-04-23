export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
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

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
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

export interface SignUpInput {
  email: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string;
}

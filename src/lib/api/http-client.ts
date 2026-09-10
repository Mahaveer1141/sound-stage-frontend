import { clearTokens, getAccessToken, refreshAccessToken } from "./token";
import {
  ApiBaseResponse,
  ApiError,
  HttpMethod,
  RequestConfig,
  QueryParams
} from "./types";

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  }

  async request<T, R extends ApiBaseResponse<T> = ApiBaseResponse<T>>(
    path: string,
    method: HttpMethod,
    config: RequestConfig = {}
  ): Promise<R> {
    const url = this.buildUrl(path, config.params);
    const headers = this.buildHeaders(config.headers);
    const options = this.buildFetchOptions(method, headers, config);

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(url, { ...options, headers });
      } catch {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
        throw new ApiError("Session expired", 401);
      }

      if (response.status === 401) {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
        throw new ApiError("Session expired", 401);
      }
    }

    return this.handleResponse<T, R>(response);
  }

  get<T, R extends ApiBaseResponse<T> = ApiBaseResponse<T>>(
    path: string,
    config?: RequestConfig
  ): Promise<R> {
    return this.request<T, R>(path, "GET", config);
  }

  post<T, R extends ApiBaseResponse<T> = ApiBaseResponse<T>>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<R> {
    return this.request<T, R>(path, "POST", { ...config, body });
  }

  put<T, R extends ApiBaseResponse<T> = ApiBaseResponse<T>>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<R> {
    return this.request<T, R>(path, "PUT", { ...config, body });
  }

  patch<T, R extends ApiBaseResponse<T> = ApiBaseResponse<T>>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<R> {
    return this.request<T, R>(path, "PATCH", { ...config, body });
  }

  delete<T, R extends ApiBaseResponse<T> = ApiBaseResponse<T>>(
    path: string,
    config?: RequestConfig
  ): Promise<R> {
    return this.request<T, R>(path, "DELETE", config);
  }

  private buildUrl(path: string, params?: QueryParams): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      url.search = this.toQueryString(params);
    }

    return url.toString();
  }

  private buildHeaders(custom?: Record<string, string>): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...custom
    });

    headers.set("Authorization", `Bearer ${getAccessToken()}`);

    return headers;
  }

  private buildFetchOptions(
    method: string,
    headers: Headers,
    config: RequestConfig
  ): RequestInit {
    const options: RequestInit = {
      method,
      headers,
      signal: config.signal
    };

    if (config.body !== undefined) {
      if (config.body instanceof FormData) {
        headers.delete("Content-Type");
        options.body = config.body;
      } else {
        options.body = JSON.stringify(config.body);
      }
    }

    if (config.cache) {
      options.cache = config.cache;
    }

    const nextOptions: NextFetchRequestConfig = {};
    if (config.revalidate !== undefined) {
      nextOptions.revalidate = config.revalidate;
    }
    if (config.tags?.length) {
      nextOptions.tags = config.tags;
    }
    if (Object.keys(nextOptions).length) {
      options.next = nextOptions;
    }

    return options;
  }

  private async handleResponse<
    T,
    R extends ApiBaseResponse<T> = ApiBaseResponse<T>
  >(response: Response): Promise<R> {
    const body = await response.json();
    if (!response.ok || !body?.success) {
      throw new ApiError(
        body?.message ?? "Something went wrong",
        response.status
      );
    }
    return {
      data: body.data as T,
      message: body.message ?? "",
      ...(body.pagination && { pagination: body.pagination })
    } as R;
  }

  toQueryString(params: QueryParams): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        for (const v of value) {
          if (v === undefined || v === null) continue;
          search.append(key, String(v));
        }
      } else {
        search.append(key, String(value));
      }
    }

    return search.toString();
  }
}

const api = new HttpClient();

export { api, HttpClient };

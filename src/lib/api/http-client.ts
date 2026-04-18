import { clearTokens, getAccessToken, refreshAccessToken } from "./token";
import { ApiError, ApiResponse, HttpMethod, RequestConfig } from "./types";

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  }

  async request<T>(
    path: string,
    method: HttpMethod,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
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

    return this.handleResponse(response);
  }

  get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request(path, "GET", config);
  }

  post<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request(path, "POST", { ...config, body });
  }

  put<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request(path, "PUT", { ...config, body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request(path, "PATCH", { ...config, body });
  }

  delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request(path, "DELETE", config);
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
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
      options.body = JSON.stringify(config.body);
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

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const body = await response.json();
    if (!response.ok || !body?.success) {
      throw new ApiError(
        body?.message ?? "Something went wrong",
        response.status
      );
    }
    return { data: body.data as T, message: body.message ?? "" };
  }
}

const api = new HttpClient();

export { api, HttpClient };

import { ApiError, TokenPair } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokenPair: TokenPair): void {
  setAccessToken(tokenPair.accessToken);
  if (tokenPair.refreshToken) {
    setRefreshToken(tokenPair.refreshToken);
  }
}

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken
        })
      });

      if (!response.ok) {
        throw new ApiError("Failed to refresh access token", response.status);
      }

      const body = await response.json();
      const data = body.data as TokenPair;

      if (!data?.accessToken) {
        throw new ApiError("Access token not found in response", 500);
      }

      setTokens(data);
      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

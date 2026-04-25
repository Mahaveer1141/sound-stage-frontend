"use client";

import useAuthStore from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const PUBLIC_ROUTE = "/";
export const AUTH_ROUTES = ["/auth", "/auth/sign_up"];
export const DEFAULT_AUTHENTICATED_ROUTE = "/rooms";

export function useAuthGuard() {
  const { user, isLoading, refreshUser } = useAuthStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTE === path;
    const isAuth = AUTH_ROUTES.includes(path);

    if (isAuth && user) {
      router.push(DEFAULT_AUTHENTICATED_ROUTE);
      return;
    }

    if (!isPublic && !isAuth && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router, path]);

  return { user, refreshUser, isUserLoading: isLoading };
}

"use client";

import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const PUBLIC_ROUTE = "/";
export const AUTH_ROUTES = ["/auth", "/auth/sign_up"];
export const DEFAULT_AUTHENTICATED_ROUTE = "/rooms";

export function useAuthGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTE === path;
    const isAuth = AUTH_ROUTES.includes(path);

    if (!isPublic && !user) {
      router.push("/auth");
    } else if (user && isAuth) {
      router.push(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [user, isLoading, router, path]);

  return { user, isUserLoading: isLoading };
}

"use client";

import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTE = "/auth";
const DEFAULT_AUTHENTICATED_ROUTE = "/rooms";

export function useAuthGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.includes(path);

    if (!isPublic && !user) {
      router.push(AUTH_ROUTE);
    } else if (user && path === AUTH_ROUTE) {
      router.push(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [user, isLoading, router]);

  return { user, isUserLoading: isLoading };
}

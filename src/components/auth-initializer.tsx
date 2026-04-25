"use client";

import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";

export default function AuthInitializer() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  useEffect(() => {
    fetchUser();
  }, []);
  return null;
}

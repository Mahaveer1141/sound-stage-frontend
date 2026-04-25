"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { clearTokens } from "@/lib/api";
import { authApi } from "@/lib/api/endpoints/auth";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

const UserMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glow" size="sm" className="gap-2 ml-2">
          <User className="w-4 h-4" />
          Account
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={async () => {
            try {
              await authApi.logout();
            } catch (err) {
              console.error(err);
            } finally {
              clearTokens();
              toast.success("Logout successful");
              window.location.href = "/auth";
            }
          }}
          className="cursor-pointer text-red-500"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = !!user;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary glow-sm group-hover:glow transition-all duration-300">
              <Mic className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">SoundStage</span>
          </Link>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <Link href="/auth">
                <Button variant="glow" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mic, LayoutGrid, Plus, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const pathname = usePathname();
  const [isLoggedIn] = useState(false);

  const navItems = [{ path: "/rooms", label: "Rooms", icon: LayoutGrid }];

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
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <Link href="/rooms/create">
                  <Button variant="glow" size="sm" className="gap-2 ml-2">
                    <Plus className="w-4 h-4" />
                    Create Room
                  </Button>
                </Link>
              </>
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

"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/dashboard"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Food Chain
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && !isDashboardRoute && (
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.name} />
                  ) : (
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.email}
                  </p>
                  <p className="text-xs font-medium mt-1">
                    Role: {user.role}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
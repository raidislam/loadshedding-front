"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL } from "@/constants/navigation";
import { initials } from "@/lib/format";
import type { User } from "@/types";

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const profileHref =
    user.role === "CUSTOMER"
      ? "/dashboard/profile"
      : user.role === "TECHNICIAN"
        ? "/technician/profile"
        : "/admin/settings";

  function handleLogout() {
    logout();
    toast.success("You have been logged out.");
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu />
      </Button>
      <p className="hidden text-sm text-muted-foreground lg:block">
        Welcome back, <span className="font-medium text-foreground">{user.name}</span>
      </p>

      <div className="flex items-center gap-2">
        {user.role === "CUSTOMER" && <NotificationBell userId={user.id} />}

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-muted"
            aria-label="Account menu"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left text-sm leading-tight sm:block">
              <span className="block font-medium">{user.name}</span>
              <span className="block text-xs text-muted-foreground">
                {ROLE_LABEL[user.role]}
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {/* GroupLabel must live inside a Group (a Base UI rule) */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profileHref)}>
              <UserIcon /> {user.role === "ADMIN" ? "Settings" : "My profile"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

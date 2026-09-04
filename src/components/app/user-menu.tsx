"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email?.trim() || "A";
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "A";
}

export function UserMenu({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-full border border-border/60 bg-background/60 px-1.5 pr-3 backdrop-blur hover:bg-accent"
          aria-label="Account menu"
        >
          <Avatar className="h-7 w-7 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
            {name?.trim() || email?.split("@")[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{name || "Athlete"}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
          <UserRound className="h-4 w-4" />
          Profile settings (soon)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            try {
              sessionStorage.clear();
            } catch {}
            await signOut({ redirect: false });
          }}
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

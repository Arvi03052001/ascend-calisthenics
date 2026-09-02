"use client";

import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AppShell } from "@/components/app/app-shell";
import { BrandMark } from "@/components/brand/brand-mark";

export default function Home() {
  const { data: session, status, update } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <BrandMark className="h-12 w-12" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading Ascend…
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return <AuthScreen onAuthed={() => update()} />;
  }

  return <AppShell />;
}

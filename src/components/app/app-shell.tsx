"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/app/user-menu";
import { Onboarding } from "@/components/app/onboarding";
import { DashboardHome } from "@/components/app/dashboard-home";
import { SectionNav } from "@/components/app/section-nav";
import { WeightLogView } from "@/components/sections/weight-log-view";
import { TrainingView } from "@/components/sections/training-view";
import type { Section } from "@/lib/sections";

type Profile = {
  name?: string | null;
  sex?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  heightCm?: number | null;
  startWeightKg?: number | null;
  targetWeightKg?: number | null;
  currentWeightKg?: number | null;
  experienceLevel?: string | null;
  trainingDays?: number | null;
  goal?: string | null;
  onboardedAt?: string | null;
};

function getInitialSection(): Section {
  if (typeof window === "undefined") return "home";
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab")?.toLowerCase();
    if (tab === "weight" || tab === "train" || tab === "home") {
      return tab as Section;
    }
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.startsWith("/train")) return "train";
    if (pathname.startsWith("/weight")) return "weight";
    if (pathname === "/home") return "home";

    const saved = sessionStorage.getItem("ascend_active_section");
    if (saved === "weight" || saved === "train" || saved === "home") {
      return saved as Section;
    }
  } catch {}
  return "home";
}

export function AppShell() {
  const { data: session } = useSession();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [section, setSection] = React.useState<Section>(getInitialSection);

  const syncSectionFromLocation = React.useCallback(() => {
    const next = getInitialSection();
    setSection(next);
  }, []);

  React.useEffect(() => {
    syncSectionFromLocation();
    window.addEventListener("popstate", syncSectionFromLocation);
    return () => window.removeEventListener("popstate", syncSectionFromLocation);
  }, [syncSectionFromLocation]);

  const handleSectionChange = React.useCallback((nextSection: Section) => {
    setSection(nextSection);
    try {
      sessionStorage.setItem("ascend_active_section", nextSection);
      const url = new URL(window.location.href);
      if (nextSection === "home") {
        url.searchParams.delete("tab");
        url.searchParams.delete("day");
        url.searchParams.delete("week");
      } else {
        url.searchParams.set("tab", nextSection);
        if (nextSection !== "train") {
          url.searchParams.delete("day");
          url.searchParams.delete("week");
        }
      }
      if (url.pathname !== "/") {
        url.pathname = "/";
      }
      window.history.pushState({ section: nextSection }, "", url.toString());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchProfile = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (res.status === 401) {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
        window.location.reload();
        return;
      }
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data.profile as Profile);
    } catch {
      setError("Could not load your profile. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onboarded = !!profile?.onboardedAt;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => handleSectionChange("home")}
            className="transition-opacity hover:opacity-80"
            aria-label="Go to home"
          >
            <BrandLogo className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu name={session?.user?.name} email={session?.user?.email} />
          </div>
        </div>
      </header>

      {onboarded && <SectionNav active={section} onChange={handleSectionChange} />}

      <main className="flex-1">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm">Loading your dashboard…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[60vh] items-center justify-center px-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : !onboarded ? (
          <Onboarding name={session?.user?.name} onDone={(p) => setProfile(p as Profile)} />
        ) : section === "home" ? (
          <DashboardHome profile={profile as Profile} onNavigate={handleSectionChange} />
        ) : section === "weight" ? (
          <WeightLogView profile={profile as Profile} />
        ) : section === "train" ? (
          <TrainingView />
        ) : null}
      </main>

      <footer className="mt-auto border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>Ascend — calisthenics &amp; conditioning coach.</p>
          <p>Built for athletes who start at zero.</p>
        </div>
      </footer>
    </div>
  );
}

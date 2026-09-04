"use client";

import { Home, Scale, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/sections";

const ICONS: Record<Section, React.ComponentType<{ className?: string }>> = {
  home: Home,
  weight: Scale,
  train: Dumbbell,
};

const LABELS: Record<Section, string> = {
  home: "Home",
  weight: "Weight",
  train: "Train",
};

const ORDER: Section[] = ["home", "weight", "train"];

export function SectionNav({
  active,
  onChange,
}: {
  active: Section;
  onChange: (s: Section) => void;
}) {
  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-30 border-b border-border/40 bg-background/70 backdrop-blur-xl py-2"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 sm:px-6">
        <div className="flex w-full sm:w-auto items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/40 p-1 backdrop-blur-md shadow-inner">
          {ORDER.map((s) => {
            const Icon = ICONS[s];
            const isActive = active === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform", isActive ? "scale-110" : "")} />
                <span>{LABELS[s]}</span>
                {s === "train" && (
                  <span
                    className={cn(
                      "hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-black/20 text-white"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    6D
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

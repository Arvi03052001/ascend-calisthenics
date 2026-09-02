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
      className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-6">
        <ul className="flex items-stretch gap-1">
          {ORDER.map((s) => {
            const Icon = ICONS[s];
            const isActive = active === s;
            return (
              <li key={s} className="flex-1">
                <button
                  type="button"
                  onClick={() => onChange(s)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex w-full flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:py-3 sm:text-sm",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{LABELS[s]}</span>
                  <span
                    className={cn(
                      "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary transition-all sm:left-4 sm:right-4",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

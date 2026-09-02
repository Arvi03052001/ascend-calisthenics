"use client";

import * as React from "react";
import {
  Dumbbell,
  Scale,
  ArrowUpRight,
  Flame,
  CalendarDays,
  Ruler,
  Timer,
  TrendingDown,
  Activity
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/sections";
import { getWeeklyMuscleFatigue, type ExerciseHeatmapData } from "@/app/actions/analytics";
import Model from "react-body-highlighter";

type Profile = {
  name?: string | null;
  sex?: string | null;
  age?: number | null;
  heightCm?: number | null;
  startWeightKg?: number | null;
  targetWeightKg?: number | null;
  currentWeightKg?: number | null;
  experienceLevel?: string | null;
  trainingDays?: number | null;
  goal?: string | null;
};

const EXPERIENCE_LABEL: Record<string, string> = {
  rookie: "Rookie",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const ROADMAP: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badge: string;
  section: Section;
}[] = [
  {
    icon: Dumbbell,
    title: "Training",
    desc: "Fixed 6-day Foundation plan with gym equipment. Log your reps, time, weight.",
    badge: "Live",
    section: "train",
  },
  {
    icon: Scale,
    title: "Weight log",
    desc: "Daily weigh-ins with a trend chart toward your target.",
    badge: "Live",
    section: "weight",
  },
];

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const HEATMAP_COLORS = [
  "#4ade80", "#67e372", "#84e863", "#a1ec54", "#bdf145",
  "#dcf536", "#facc15", "#fbbf24", "#fba331", "#fb873e",
  "#fa6a4a", "#f94e57", "#ef4444", "#dc2626", "#b91c1c",
];

export function DashboardHome({
  profile,
  onNavigate,
}: {
  profile: Profile;
  onNavigate?: (s: Section) => void;
}) {
  const [fatigueData, setFatigueData] = React.useState<ExerciseHeatmapData[] | null>(null);

  React.useEffect(() => {
    getWeeklyMuscleFatigue()
      .then((data) => setFatigueData(data))
      .catch(console.error);
  }, []);

  const start = profile.startWeightKg ?? profile.currentWeightKg ?? 0;
  const target = profile.targetWeightKg ?? start;
  const current = profile.currentWeightKg ?? start;

  const toGo = Math.max(0, current - target);
  const totalSpan = Math.max(0.1, start - target);
  const done = Math.max(0, Math.min(100, ((start - current) / totalSpan) * 100));
  const goingDown = current >= target;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Hero */}
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {todayLabel()}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {profile.name?.split(" ")[0] ?? "athlete"}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.goal
              ? `Mission: ${profile.goal}`
              : "Here&apos;s where your ascent stands today."}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 bg-primary/10 text-primary"
        >
          <Flame className="h-3.5 w-3.5" />
          {EXPERIENCE_LABEL[profile.experienceLevel ?? "rookie"] ?? "Rookie"} tier
        </Badge>
      </header>

      {/* Mission card */}
      <Card className="mb-6 overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
            {/* Numbers */}
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingDown className="h-4 w-4 text-primary" />
                Weight mission
              </div>

              <div className="mt-4 flex items-end gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Current
                  </p>
                  <p className="text-4xl font-semibold tracking-tight">
                    {current.toFixed(1)}
                    <span className="ml-1 text-lg font-normal text-muted-foreground">
                      kg
                    </span>
                  </p>
                </div>
                <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                  <ArrowUpRight className="h-5 w-5 rotate-45 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Target
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-muted-foreground">
                    {target.toFixed(1)}
                    <span className="ml-1 text-sm font-normal">kg</span>
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Start {start.toFixed(1)} kg</span>
                  <span>{done.toFixed(0)}% there</span>
                </div>
                <Progress value={done} className="h-2.5" />
                <p className="mt-2 text-sm">
                  {goingDown ? (
                    <>
                      <span className="font-semibold text-primary">
                        {toGo.toFixed(1)} kg
                      </span>{" "}
                      to go until your target.
                    </>
                  ) : (
                    <span className="text-primary">Target reached. Time to set a new one.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-px border-t bg-border/60 md:border-l md:border-t-0">
              <StatTile icon={Ruler} label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
              <StatTile icon={Timer} label="Age" value={profile.age ? `${profile.age}` : "—"} />
              <StatTile icon={CalendarDays} label="Train days" value={profile.trainingDays ? `${profile.trainingDays}/wk` : "—"} />
              <StatTile icon={Flame} label="Start weight" value={`${start.toFixed(1)} kg`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Fatigue Heatmap */}
      <Card className="mb-6 border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Muscle Fatigue (7 Days)
          </CardTitle>
          <CardDescription>
            Training volume breakdown based on your logged sets.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!fatigueData ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Loading anatomical model...
            </div>
          ) : fatigueData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No sets logged in the past 7 days.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row w-full items-center justify-around py-8 bg-background">
              <div className="flex flex-col items-center gap-4">
                <Model
                  type="anterior"
                  data={fatigueData}
                  highlightedColors={HEATMAP_COLORS}
                  bodyColor="#475569"
                  style={{ width: "12rem", height: "auto" }}
                  svgStyle={{ width: "100%", height: "100%" }}
                />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Anterior</span>
              </div>
              <div className="h-px w-full sm:h-48 sm:w-px bg-border/50 my-6 sm:my-0" />
              <div className="flex flex-col items-center gap-4">
                <Model
                  type="posterior"
                  data={fatigueData}
                  highlightedColors={HEATMAP_COLORS}
                  bodyColor="#475569"
                  style={{ width: "12rem", height: "auto" }}
                  svgStyle={{ width: "100%", height: "100%" }}
                />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Posterior</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roadmap */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Your training system</h2>
        <span className="text-xs text-muted-foreground">
          Modules unlock as we build them
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ROADMAP.map((m) => {
          const isLive = m.badge === "Live";
          return (
            <Card
              key={m.title}
              className={cn(
                "group relative overflow-hidden transition-all",
                isLive ? "cursor-pointer hover:border-primary/40 hover:shadow-md" : "opacity-90"
              )}
              onClick={isLive ? () => onNavigate?.(m.section) : undefined}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <m.icon className="h-5 w-5" />
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1",
                      isLive
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isLive ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                    {m.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-base">{m.title}</CardTitle>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                    isLive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isLive ? "Open" : "Coming soon"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card p-4 sm:p-5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

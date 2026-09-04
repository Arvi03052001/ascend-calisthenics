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

const DAY_ROUTINES = [
  { day: "Monday", focus: "Chest + Triceps + Grip + Core", dayParam: "monday" },
  { day: "Tuesday", focus: "Back + Biceps + Legs + Mobility", dayParam: "tuesday" },
  { day: "Wednesday", focus: "Shoulders + Grip + Core", dayParam: "wednesday" },
  { day: "Thursday", focus: "Legs + Lower Body + Core", dayParam: "thursday" },
  { day: "Friday", focus: "Full Push + Grip + Core", dayParam: "friday" },
  { day: "Saturday", focus: "Full Body Test + Conditioning", dayParam: "saturday" },
];

export function DashboardHome({
  profile,
  onNavigate,
}: {
  profile: Profile;
  onNavigate?: (s: Section) => void;
}) {
  const [fatigueData, setFatigueData] = React.useState<ExerciseHeatmapData[] | null>(null);
  const [selectedMuscle, setSelectedMuscle] = React.useState<{ muscle: string, frequency: number, exercises: string[] } | null>(null);

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

  // Calculate current weekday
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon..5=Sat, 6=Sun
  const todayWorkout = dayOfWeek < 6 ? DAY_ROUTINES[dayOfWeek] : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card/50 to-primary/5 p-6 sm:p-8 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-xs">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                {todayLabel()}
              </span>
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
              >
                <Flame className="h-3.5 w-3.5 fill-primary/30" />
                {EXPERIENCE_LABEL[profile.experienceLevel ?? "rookie"] ?? "Rookie"} Tier
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Welcome back, <span className="text-gradient-emerald">{profile.name?.split(" ")[0] ?? "Athlete"}</span>.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              {profile.goal
                ? `Active Mission: ${profile.goal}. Consistency is your competitive advantage.`
                : "Your calisthenics progression console. Log sets, build volume, elevate."}
            </p>
          </div>

          {/* Today's Mission Action Pill */}
          {todayWorkout ? (
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 backdrop-blur-md">
              <div className="text-left lg:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Today's Mission
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {todayWorkout.day} — {todayWorkout.focus.split("+")[0]?.trim()}
                </p>
              </div>
              <Button
                onClick={() => {
                  try {
                    const url = new URL(window.location.href);
                    url.searchParams.set("tab", "train");
                    url.searchParams.set("day", todayWorkout.dayParam);
                    window.history.pushState({}, "", url.toString());
                  } catch {}
                  onNavigate?.("train");
                }}
                className="gap-2 rounded-xl font-semibold shadow-md shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Dumbbell className="h-4 w-4" />
                Start Today's Workout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-4">
              <span className="text-2xl">😴</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sunday Rest Day</p>
                <p className="text-sm font-medium text-foreground">Recovery is where the adaptation happens.</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mission & Stats Glass Card */}
      <Card className="glass-card card-hover overflow-hidden border border-border/70 rounded-3xl shadow-sm">
        <CardContent className="p-0">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
            {/* Weight Goal Progress */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <TrendingDown className="h-4 w-4" />
                    Weight Transformation
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {done.toFixed(0)}% Achieved
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Current Weight
                    </p>
                    <p className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                      {current.toFixed(1)}
                      <span className="ml-1 text-lg font-normal text-muted-foreground">kg</span>
                    </p>
                  </div>
                  
                  <div className="text-muted-foreground/50 pb-2 text-2xl font-light">→</div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Target Goal
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight text-muted-foreground">
                      {target.toFixed(1)}
                      <span className="ml-1 text-sm font-normal">kg</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Start: {start.toFixed(1)} kg</span>
                  <span className="font-semibold text-foreground">
                    {goingDown ? `${toGo.toFixed(1)} kg remaining` : "Goal Achieved! 🎉"}
                  </span>
                  <span>Target: {target.toFixed(1)} kg</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-emerald-400 transition-all duration-500 shadow-sm"
                    style={{ width: `${done}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats Matrix */}
            <div className="grid grid-cols-2 gap-px border-t bg-border/50 lg:border-l lg:border-t-0">
              <StatTile icon={Ruler} label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
              <StatTile icon={Timer} label="Athlete Age" value={profile.age ? `${profile.age} yrs` : "—"} />
              <StatTile icon={CalendarDays} label="Training Schedule" value={profile.trainingDays ? `${profile.trainingDays} days/wk` : "6 days/wk"} />
              <StatTile icon={Flame} label="Start Baseline" value={`${start.toFixed(1)} kg`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Muscle Fatigue Heatmap Console */}
      <Card className="glass-card overflow-hidden border border-border/70 rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                Muscle Fatigue Diagnostics
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                7-day cumulative volume mapped to human musculoskeletal levers. Tap any muscle to inspect.
              </CardDescription>
            </div>
            {selectedMuscle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMuscle(null)}
                className="h-7 text-xs text-muted-foreground self-start sm:self-auto"
              >
                Clear selection
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0 pb-6">
          {!fatigueData ? (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              <Activity className="h-5 w-5 animate-pulse text-primary mr-2" />
              Loading anatomical model...
            </div>
          ) : fatigueData.length === 0 ? (
            <div className="flex flex-col h-72 items-center justify-center gap-2 text-sm text-muted-foreground p-4 text-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/40 mb-1" />
              <p className="font-semibold text-foreground">No volume logged in the past 7 days</p>
              <p className="text-xs max-w-sm">Complete your training sessions to see which muscles are fatigued and recovering.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex flex-col sm:flex-row w-full items-center justify-around py-8 px-4 bg-background/50">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground rounded-full bg-muted/50 px-3 py-1">
                    Anterior (Front)
                  </span>
                  <div className="relative p-2 rounded-2xl bg-card/60 border border-border/40 shadow-inner">
                    <Model
                      type="anterior"
                      data={fatigueData}
                      highlightedColors={HEATMAP_COLORS}
                      bodyColor="#334155"
                      style={{ width: "13rem", height: "auto", cursor: "pointer" }}
                      svgStyle={{ width: "100%", height: "100%" }}
                      onClick={(exercise) => {
                        if (exercise?.muscle) {
                          setSelectedMuscle({
                            muscle: exercise.muscle,
                            frequency: exercise.data.frequency,
                            exercises: exercise.data.exercises
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="h-px w-full sm:h-64 sm:w-px bg-border/40 my-6 sm:my-0" />

                <div className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground rounded-full bg-muted/50 px-3 py-1">
                    Posterior (Back)
                  </span>
                  <div className="relative p-2 rounded-2xl bg-card/60 border border-border/40 shadow-inner">
                    <Model
                      type="posterior"
                      data={fatigueData}
                      highlightedColors={HEATMAP_COLORS}
                      bodyColor="#334155"
                      style={{ width: "13rem", height: "auto", cursor: "pointer" }}
                      svgStyle={{ width: "100%", height: "100%" }}
                      onClick={(exercise) => {
                        if (exercise?.muscle) {
                          setSelectedMuscle({
                            muscle: exercise.muscle,
                            frequency: exercise.data.frequency,
                            exercises: exercise.data.exercises
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Muscle Inspector & Spectrum */}
              <div className="w-full max-w-md px-6 pt-5 flex flex-col items-center gap-4">
                {selectedMuscle ? (
                  <div className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                      <span className="text-base font-bold capitalize text-foreground">
                        {selectedMuscle.muscle.replace("-", " ")}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                      <span>{selectedMuscle.frequency} sets logged this week</span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground line-clamp-2">
                      Targeted by: {selectedMuscle.exercises.join(", ")}
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground/80 italic h-[72px] flex items-center justify-center rounded-2xl border border-dashed border-border/60 w-full px-4 text-center">
                    💡 Tap any colored muscle on the body model to view logged volume & exercises
                  </div>
                )}
                
                {/* Volume Gradient Bar */}
                <div className="w-full flex flex-col items-center gap-1.5 pb-2">
                  <div className="flex w-full justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <span>1–2 Sets (Low)</span>
                    <span>6–8 Sets (Optimal)</span>
                    <span>12+ Sets (Peak)</span>
                  </div>
                  <div 
                    className="h-2 w-full rounded-full shadow-inner" 
                    style={{ background: `linear-gradient(to right, ${HEATMAP_COLORS[0]}, ${HEATMAP_COLORS[Math.floor(HEATMAP_COLORS.length/2)]}, ${HEATMAP_COLORS[HEATMAP_COLORS.length-1]})` }} 
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training System Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Core Modules</h2>
            <p className="text-xs text-muted-foreground">Jump directly into workout logging or body composition tracking</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROADMAP.map((m) => {
            const isLive = m.badge === "Live";
            return (
              <Card
                key={m.title}
                className={cn(
                  "glass-card card-hover group relative overflow-hidden rounded-3xl border border-border/70 transition-all",
                  isLive ? "cursor-pointer hover:border-primary/50" : "opacity-90"
                )}
                onClick={isLive ? () => onNavigate?.(m.section) : undefined}
              >
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 duration-200">
                      <m.icon className="h-6 w-6" />
                    </span>
                    <Badge
                      variant="outline"
                      className="gap-1 rounded-full border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      {m.badge}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-lg font-bold">{m.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">{m.desc}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:underline">
                    {m.section === "train" ? "Open Training Schedule" : "Open Weight History"}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
    <div className="bg-card/70 p-5 sm:p-6 transition-colors hover:bg-card">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        {label}
      </div>
      <p className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-foreground">{value}</p>
    </div>
  );
}

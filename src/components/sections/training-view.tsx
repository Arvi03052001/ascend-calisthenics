"use client";

import * as React from "react";
import {
  Dumbbell, Clock, CheckCircle2, Info, TrendingUp, ChevronDown,
  Play, Save, Loader2, RotateCcw, Trash2, Plus, ChevronLeft, ChevronRight, Calendar, AlertCircle, XCircle, Sparkles,
  Target, Flame, Zap, Check, Lock, ShieldAlert, TrendingDown, Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { AIProgressionResult } from "@/lib/ai-progression";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { secondsToHHMMSS, hhmmssToSeconds, formatHumanTime, getMonday, formatIndianDate } from "@/lib/date-utils";
import { getSkillRegression, type RegressionOption } from "@/lib/skill-regressions";
import { ExerciseDemoModal } from "@/components/ui/exercise-demo-modal";

const PHASE_ORDER = ["Warm-Up", "Skill Work", "Main Strength", "Accessories", "Finisher", "Cooldown"];
const PHASE_META: Record<string, { label: string; color: string }> = {
  "Warm-Up": { label: "Warm-Up", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  "Skill Work": { label: "Skill Practice", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  "Main Strength": { label: "Main Strength", color: "bg-primary/10 text-primary" },
  "Accessories": { label: "Accessories", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "Finisher": { label: "Finisher", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  "Cooldown": { label: "Cooldown", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
};

const DAY_INFO = [
  { day: "Monday", focus: "Chest + Triceps + Grip + Core" },
  { day: "Tuesday", focus: "Back + Biceps + Legs + Mobility" },
  { day: "Wednesday", focus: "Shoulders + Grip + Core" },
  { day: "Thursday", focus: "Legs + Lower Body + Core" },
  { day: "Friday", focus: "Full Push + Grip + Core" },
  { day: "Saturday", focus: "Full Body Test + Conditioning" },
];

const FOUNDATION_CHECKLIST = [
  { skill: "Dead Hang", target: "60 sec" }, { skill: "Active Hang", target: "30 sec" },
  { skill: "Scapular Pull-Up", target: "3 x 10" }, { skill: "Push-Up", target: "3 x 15" },
  { skill: "Bench Dip", target: "3 x 15" }, { skill: "Hollow Hold", target: "45 sec" },
  { skill: "Lying Leg Raise", target: "3 x 12" }, { skill: "Bodyweight Squat", target: "3 x 20" },
  { skill: "Bulgarian Split Squat", target: "3 x 10/leg" }, { skill: "Deep Squat Hold", target: "60 sec" },
  { skill: "Tuck Hold", target: "30 sec" },
];
const PROGRESSION_RULES = [
  "Every week, try to beat last week's TOTAL numbers (even by 1-2 reps/seconds)",
  "On machines (assisted chin/dip), reduce the assistance weight slightly once reps feel easy",
  "On push-ups, once you hit 15 clean reps on a level (wall→incline→knee→standard), move to the next harder variation",
  "On holds (plank, hollow hold, squat hold), add 5-10 seconds once you hit your current set target for 2 sessions in a row",
  "If a number doesn't move for 2+ weeks, deload slightly and rebuild — totally normal, not failure",
];

type DBExercise = {
  id: number; dayName: string; dayNumber: number; focus: string;
  phase: string; orderInPhase: number; exerciseName: string;
  equipment: string | null; sets: string; repsOrDuration: string | null;
  rest: string | null; coachingNotes: string | null;
};
type LogEntry = {
  id: string; exerciseName: string; phase: string; equipment: string | null;
  setNumber: number; targetReps: string | null; targetTime: string | null;
  actualReps: number | null; actualWeight: number | null; actualTime: number | null;
  notes: string | null; completed: boolean;
};
type WorkoutStatus = "none" | "planned" | "in_progress" | "completed";

type DayStatusInfo = {
  dayIndex: number;
  dateStr: string;
  formattedDate: string;
  isToday: boolean;
  status: "completed" | "in_progress" | "missed" | "upcoming";
  workoutId: string | null;
  loggedSets: number;
  totalSets: number;
};

const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const DAY_PARAM_MAP: Record<string, number> = {
  monday: 0, mon: 0, "0": 0,
  tuesday: 1, tue: 1, "1": 1,
  wednesday: 2, wed: 2, "2": 2,
  thursday: 3, thu: 3, "3": 3,
  friday: 4, fri: 4, "4": 4,
  saturday: 5, sat: 5, "5": 5,
};

function getInitialDay(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const dayParam = params.get("day")?.toLowerCase();
    if (dayParam && DAY_PARAM_MAP[dayParam] !== undefined) {
      return DAY_PARAM_MAP[dayParam];
    }
    const pathParts = window.location.pathname.toLowerCase().split("/").filter(Boolean);
    if (pathParts[0] === "train" && pathParts[1] && DAY_PARAM_MAP[pathParts[1]] !== undefined) {
      return DAY_PARAM_MAP[pathParts[1]];
    }
    const activeTab = params.get("tab")?.toLowerCase() || sessionStorage.getItem("ascend_active_section");
    if (activeTab === "train") {
      const saved = sessionStorage.getItem("ascend_train_day");
      if (saved && DAY_PARAM_MAP[saved] !== undefined) {
        return DAY_PARAM_MAP[saved];
      }
    }
  } catch {}
  return null;
}

function getInitialWeek(): number {
  if (typeof window === "undefined") return 0;
  try {
    const params = new URLSearchParams(window.location.search);
    const weekParam = params.get("week");
    if (weekParam && !isNaN(Number(weekParam))) {
      return Number(weekParam);
    }
  } catch {}
  return 0;
}

export function TrainingView() {
  const [selectedDay, setSelectedDay] = React.useState<number | null>(getInitialDay);
  const [showChecklist, setShowChecklist] = React.useState(false);
  const [showRules, setShowRules] = React.useState(false);
  const [weekOffset, setWeekOffset] = React.useState<number>(getInitialWeek);
  const [weekStatusData, setWeekStatusData] = React.useState<{
    weekStartStr: string;
    formattedWeekRange: string;
    days: DayStatusInfo[];
  } | null>(null);
  const [loadingWeek, setLoadingWeek] = React.useState(true);

  // Sync state when browser back/forward buttons are used
  const syncStateFromLocation = React.useCallback(() => {
    setSelectedDay(getInitialDay());
    setWeekOffset(getInitialWeek());
  }, []);

  React.useEffect(() => {
    window.addEventListener("popstate", syncStateFromLocation);
    return () => window.removeEventListener("popstate", syncStateFromLocation);
  }, [syncStateFromLocation]);

  const handleSelectDay = React.useCallback((idx: number | null) => {
    setSelectedDay(idx);
    try {
      const url = new URL(window.location.href);
      if (idx !== null && DAY_NAMES[idx]) {
        url.searchParams.set("tab", "train");
        url.searchParams.set("day", DAY_NAMES[idx]);
        sessionStorage.setItem("ascend_train_day", DAY_NAMES[idx]);
      } else {
        url.searchParams.delete("day");
        sessionStorage.removeItem("ascend_train_day");
      }
      if (url.pathname !== "/") {
        url.pathname = "/";
      }
      window.history.pushState({ dayIndex: idx }, "", url.toString());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleWeekOffsetChange = React.useCallback((offset: number) => {
    setWeekOffset(offset);
    try {
      const url = new URL(window.location.href);
      if (offset !== 0) {
        url.searchParams.set("week", String(offset));
      } else {
        url.searchParams.delete("week");
      }
      if (url.pathname !== "/") {
        url.pathname = "/";
      }
      window.history.pushState({ weekOffset: offset }, "", url.toString());
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Compute Monday date string based on weekOffset in a timezone-safe manner
  const targetMondayStr = React.useMemo(() => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    const dayOfWeek = d.getUTCDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setUTCDate(d.getUTCDate() + diff + weekOffset * 7);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [weekOffset]);

  const fallbackFormattedDate = React.useMemo(() => {
    if (selectedDay === null) return undefined;
    try {
      const monday = getMonday(targetMondayStr);
      const dayDate = new Date(monday);
      dayDate.setUTCDate(monday.getUTCDate() + selectedDay);
      return formatIndianDate(dayDate);
    } catch {
      return undefined;
    }
  }, [selectedDay, targetMondayStr]);

  const fetchWeekStatus = React.useCallback(() => {
    setLoadingWeek(true);
    fetch(`/api/training-workout/week-status?weekStart=${targetMondayStr}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setWeekStatusData(data))
      .catch(() => setWeekStatusData(null))
      .finally(() => setLoadingWeek(false));
  }, [targetMondayStr]);

  React.useEffect(() => {
    fetchWeekStatus();
  }, [fetchWeekStatus]);

  if (selectedDay !== null) {
    return (
      <DayDetail
        dayIndex={selectedDay}
        weekStartStr={weekStatusData?.weekStartStr ?? targetMondayStr}
        dayDateFormatted={weekStatusData?.days[selectedDay]?.formattedDate ?? fallbackFormattedDate}
        onBack={() => {
          handleSelectDay(null);
          fetchWeekStatus();
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      {/* Header & Week Selector */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/15">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Weekly Calisthenics Routine
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              6-Day periodized progression split · Track volume & overload
            </p>
          </div>
        </div>

        {/* Week Date Picker Navigation Ribbon */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/40 p-1.5 backdrop-blur-md shadow-xs self-start sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80"
            onClick={() => handleWeekOffsetChange(weekOffset - 1)}
            title="Previous Week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-2 text-xs font-bold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{loadingWeek ? "Loading..." : weekStatusData?.formattedWeekRange}</span>
          </div>

          {weekOffset !== 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 rounded-xl px-2.5 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20"
              onClick={() => handleWeekOffsetChange(0)}
            >
              Current Week
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80"
            onClick={() => handleWeekOffsetChange(weekOffset + 1)}
            title="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Grid of 6 Days */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DAY_INFO.map((dayInfo, idx) => {
          const statusInfo = weekStatusData?.days[idx];
          const status = statusInfo?.status ?? "upcoming";
          const isToday = statusInfo?.isToday ?? false;

          let cardBorderClass = "border-border/60 hover:border-primary/40";
          let bgTint = "bg-card/70";

          if (status === "completed") {
            cardBorderClass = "border-emerald-500/40 hover:border-emerald-500/60";
            bgTint = "bg-emerald-500/5 dark:bg-emerald-950/20";
          } else if (status === "in_progress" || isToday) {
            cardBorderClass = "border-primary/60 shadow-md shadow-primary/10";
            bgTint = "bg-primary/5";
          } else if (status === "missed") {
            cardBorderClass = "border-rose-500/30 hover:border-rose-500/50";
            bgTint = "bg-rose-500/5";
          }

          // Split focus into tags
          const focusTags = dayInfo.focus.split("+").map(t => t.trim());

          return (
            <Card
              key={dayInfo.day}
              className={cn(
                "glass-card card-hover group cursor-pointer overflow-hidden rounded-3xl border transition-all duration-200",
                cardBorderClass,
                bgTint
              )}
              onClick={() => handleSelectDay(idx)}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                        {dayInfo.day}
                      </CardTitle>
                      {isToday && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground shadow-xs animate-pulse">
                          TODAY
                        </span>
                      )}
                    </div>
                    {statusInfo?.formattedDate && (
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {statusInfo.formattedDate}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  {status === "completed" && (
                    <Badge className="gap-1 rounded-full border-emerald-500/30 bg-emerald-500/15 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </Badge>
                  )}
                  {status === "in_progress" && (
                    <Badge className="gap-1 rounded-full border-primary/30 bg-primary/20 text-[11px] font-bold text-primary animate-pulse">
                      <Play className="h-3 w-3 fill-current" /> In Progress
                    </Badge>
                  )}
                  {status === "missed" && (
                    <Badge className="gap-1 rounded-full border-rose-500/30 bg-rose-500/15 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <XCircle className="h-3 w-3" /> Missed
                    </Badge>
                  )}
                  {status === "upcoming" && !isToday && (
                    <Badge variant="outline" className="rounded-full text-[10px] text-muted-foreground border-border/60">
                      Upcoming
                    </Badge>
                  )}
                </div>

                {/* Focus Pill Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {focusTags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="rounded-lg bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-3.5 w-3.5 text-primary/70" /> ~18 exercises
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary/70" /> ~2 hrs
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-bold text-primary text-xs group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-8 border-dashed">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">😴</span>
            <div>
              <p className="text-sm font-medium">Sunday — Rest & Recover</p>
              <p className="text-xs text-muted-foreground">Muscle grows when you rest.</p>
            </div>
          </div>
          {weekStatusData?.days[5] && (
            <span className="text-xs font-semibold text-muted-foreground">
              🗓️ {weekStatusData.formattedWeekRange.split(" – ")[1]}
            </span>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="cursor-pointer pb-2" onClick={() => setShowRules(!showRules)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />Progression Rules
            </CardTitle>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showRules && "rotate-180")} />
          </div>
        </CardHeader>
        {showRules && (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {PROGRESSION_RULES.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="font-bold text-primary">{i + 1}.</span>
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      <InteractiveFoundationChecklist showChecklist={showChecklist} setShowChecklist={setShowChecklist} />
    </div>
  );
}

type CheckpointData = {
  masteredCount: number;
  totalCount: number;
  overallPercent: number;
  foundation11Mastered?: number;
  foundation11Total?: number;
  checkpoints: Array<{
    num?: number;
    id: string;
    skillName: string;
    tier?: string;
    category: string;
    targetMetric: string;
    achieved: boolean;
    bestValueStr: string;
    completionPercent: number;
    status: "mastered" | "developing" | "lagging" | "not_started";
  }>;
  laggingFocusList: Array<{
    skillName: string;
    completionPercent: number;
    targetMetric: string;
  }>;
};

const TIERS = [
  { id: "Foundation", label: "🟢 Foundation" },
  { id: "Beginner", label: "🔵 Beginner" },
  { id: "Intermediate", label: "🟠 Intermediate" },
  { id: "Advanced", label: "🔴 Advanced" },
  { id: "Elite", label: "🟣 Elite" },
];

function InteractiveFoundationChecklist({ showChecklist, setShowChecklist }: {
  showChecklist: boolean;
  setShowChecklist: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [data, setData] = React.useState<CheckpointData | null>(null);
  const [activeTier, setActiveTier] = React.useState<string>("Foundation");
  const [loading, setLoading] = React.useState(true);

  const fetchCheckpoints = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/training-workout/checkpoints?tier=${activeTier}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTier]);

  React.useEffect(() => {
    fetchCheckpoints();
  }, [fetchCheckpoints]);

  async function handleToggle(skillName: string, currentAchieved: boolean) {
    try {
      const res = await fetch("/api/training-workout/checkpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, achieved: !currentAchieved }),
      });
      if (res.ok) {
        toast.success(currentAchieved ? `Unmarked ${skillName}` : `🎉 Mastered ${skillName}!`);
        fetchCheckpoints();
      }
    } catch {
      toast.error("Could not update milestone.");
    }
  }

  return (
    <Card className="border-primary/30 shadow-sm">
      <CardHeader className="cursor-pointer pb-3" onClick={() => setShowChecklist(!showChecklist)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Calisthenics Skill Mastery Roadmap (161 Skills)</CardTitle>
              <CardDescription className="text-xs">
                5 Mastery Tiers · 11 Gateway Milestones · Adaptive AI Overload Engine
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                {data.masteredCount} / {data.totalCount} Mastered ({data.overallPercent}%)
              </Badge>
            )}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showChecklist && "rotate-180")} />
          </div>
        </div>

        {data && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${data.overallPercent}%` }}
            />
          </div>
        )}
      </CardHeader>

      {showChecklist && (
        <CardContent className="pt-0 space-y-4">
          {/* Tier Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-2">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTier(tier.id);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  activeTier === tier.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Lagging Focus Priority Banner */}
          {data && data.laggingFocusList.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                <Flame className="h-4 w-4 text-amber-500" />
                ⚡ AI Lagging Focus Area — {activeTier} Tier Priority
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Your performance is lowest in these skills. AI Overload Engine prioritizes your effort here:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.laggingFocusList.slice(0, 3).map((item) => (
                  <Badge key={item.skillName} className="border-amber-500/40 bg-amber-500/20 text-amber-800 dark:text-amber-200">
                    ⚠️ {item.skillName} ({item.completionPercent}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills Grid */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data?.checkpoints.map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(item.skillName, item.achieved);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm",
                  item.achieved
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : item.status === "lagging"
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border/50 bg-card"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-all",
                    item.achieved
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border/60 bg-muted text-muted-foreground"
                  )}
                >
                  {item.achieved ? <Check className="h-4 w-4" /> : item.num ? item.num : null}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="truncate text-xs font-semibold leading-none">{item.skillName}</p>
                    </div>
                    {item.achieved ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">🟢 MASTERED</span>
                    ) : item.status === "lagging" ? (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">⚡ LAGGING</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.completionPercent}%</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Target: <span className="font-medium text-foreground">{item.targetMetric}</span></span>
                    <span>Best: <span className="font-medium text-foreground">{item.bestValueStr}</span></span>
                  </div>

                  {!item.achieved && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full transition-all",
                          item.status === "lagging" ? "bg-amber-500" : "bg-primary"
                        )}
                        style={{ width: `${item.completionPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function DayDetail({ dayIndex, weekStartStr, dayDateFormatted, onBack }: {
  dayIndex: number;
  weekStartStr?: string;
  dayDateFormatted?: string;
  onBack: () => void;
}) {
  const dayInfo = DAY_INFO[dayIndex];
  const [dbExercises, setDbExercises] = React.useState<DBExercise[]>([]);
  const [loadingExercises, setLoadingExercises] = React.useState(true);
  const [status, setStatus] = React.useState<WorkoutStatus>("none");
  const [workoutId, setWorkoutId] = React.useState<string | null>(null);
  const [entries, setEntries] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [starting, setStarting] = React.useState(false);
  const [completing, setCompleting] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [showReset, setShowReset] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/weekly-plan?day=${dayIndex + 1}`, { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setDbExercises(data.exercises || []))
      .catch(() => setDbExercises([]))
      .finally(() => setLoadingExercises(false));
  }, [dayIndex]);

  React.useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 5000);
    (async () => {
      try {
        const query = weekStartStr ? `dayIndex=${dayIndex}&weekStart=${weekStartStr}` : `dayIndex=${dayIndex}`;
        const res = await fetch(`/api/training-workout?${query}`, { cache: "no-store" });
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.workout) { setWorkoutId(data.workout.id); setStatus(data.workout.status); setEntries(data.workout.entries || []); }
        }
      } catch {} finally { if (!cancelled) { clearTimeout(timeout); setLoading(false); } }
    })();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [dayIndex, weekStartStr]);

  async function handleStart(): Promise<string | null> {
    setStarting(true);
    try {
      const res = await fetch("/api/training-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayIndex, weekStart: weekStartStr }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWorkoutId(data.workout.id);
      setEntries(data.workout.entries);
      setStatus("in_progress");
      toast.success("Workout started — log your sets below!");
      return data.workout.id;
    } catch {
      toast.error("Could not start workout.");
      return null;
    } finally {
      setStarting(false);
    }
  }

  // Auto-sync dbExercises when entries already contain regressed items from previous sessions
  React.useEffect(() => {
    if (entries.length > 0 && dbExercises.length > 0) {
      let changed = false;
      const updated = dbExercises.map((ex) => {
        const match = entries.find((e) => e.phase === ex.phase && e.notes?.includes(`Regressed from ${ex.exerciseName}`));
        if (match) {
          changed = true;
          return {
            ...ex,
            exerciseName: match.exerciseName,
            repsOrDuration: match.targetReps || match.targetTime || ex.repsOrDuration,
            equipment: match.equipment || ex.equipment,
          };
        }
        return ex;
      });
      if (changed) setDbExercises(updated);
    }
  }, [entries, dbExercises]);

  async function handleRegressSuccess(
    originalName: string,
    newName: string,
    newTarget: string,
    newEquipment?: string | null,
    newNotes?: string | null
  ) {
    setDbExercises((prev) =>
      prev.map((item) =>
        item.exerciseName === originalName
          ? {
              ...item,
              exerciseName: newName,
              repsOrDuration: newTarget,
              equipment: newEquipment !== undefined ? newEquipment : item.equipment,
              coachingNotes: newNotes || item.coachingNotes,
            }
          : item
      )
    );

    // Refresh workout entries
    if (workoutId) {
      try {
        const query = weekStartStr ? `dayIndex=${dayIndex}&weekStart=${weekStartStr}` : `dayIndex=${dayIndex}`;
        const res = await fetch(`/api/training-workout?${query}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.workout?.entries) {
            setEntries(data.workout.entries);
          }
        }
      } catch {}
    }
  }

  async function handleComplete() {
    if (!workoutId) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/training-workout/${workoutId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
      if (!res.ok) throw new Error();
      setStatus("completed"); toast.success("Workout complete! Great work. 💪");
    } catch { toast.error("Could not mark complete."); } finally { setCompleting(false); }
  }

  async function handleReset() {
    if (!workoutId) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/training-workout/${workoutId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: true }) });
      if (!res.ok) throw new Error();
      setStatus("none"); setEntries([]); setShowReset(false); toast.success("Workout reset. Start fresh!");
    } catch { toast.error("Could not reset."); } finally { setResetting(false); }
  }

  async function handleSaveEntry(entryId: string, data: Partial<LogEntry>) {
    try {
      const res = await fetch(`/api/training-workout/entries/${entryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, ...data } : e));
    } catch { toast.error("Could not save log."); }
  }

  async function handleAddSet(exercise: DBExercise) {
    if (!workoutId) return;
    const existingEntries = entries.filter(e => e.exerciseName === exercise.exerciseName && e.phase === exercise.phase);
    const nextSetNumber = existingEntries.length > 0 ? Math.max(...existingEntries.map(e => e.setNumber)) + 1 : 1;
    const targetIsTime = exercise.repsOrDuration && (
      exercise.repsOrDuration.toLowerCase().includes("sec") ||
      exercise.repsOrDuration.toLowerCase().includes("min") ||
      exercise.repsOrDuration.toLowerCase().includes("hold")
    );
    try {
      const res = await fetch("/api/training-workout/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId,
          exerciseName: exercise.exerciseName,
          phase: exercise.phase,
          equipment: exercise.equipment,
          setNumber: nextSetNumber,
          targetReps: targetIsTime ? null : exercise.repsOrDuration,
          targetTime: targetIsTime ? exercise.repsOrDuration : null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntries(prev => [...prev, data.entry]);
      toast.success(`Set ${nextSetNumber} added`);
    } catch { toast.error("Could not add set."); }
  }

  async function handleRemoveSet(entryId: string) {
    try {
      const res = await fetch(`/api/training-workout/entries/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success("Set removed");
    } catch { toast.error("Could not remove set."); }
  }

  const canEdit = status === "in_progress" || editMode;
  const completedCount = entries.filter(e => e.completed).length;
  const groupedExercises = React.useMemo(() => {
    const groups: Record<string, DBExercise[]> = {};
    for (const phase of PHASE_ORDER) { const items = dbExercises.filter(e => e.phase === phase); if (items.length > 0) groups[phase] = items.sort((a,b) => a.orderInPhase - b.orderInPhase); }
    return groups;
  }, [dbExercises]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Weekly Routine
      </Button>

      {/* Day Session Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/60 to-primary/5 p-6 sm:p-8 backdrop-blur-xl shadow-lg shadow-black/5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {dayInfo.day}
              </h1>
              {dayDateFormatted && (
                <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  🗓️ {dayDateFormatted}
                </span>
              )}
            </div>

            {/* Muscle Focus Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dayInfo.focus.split("+").map((f, i) => (
                <span key={i} className="rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {f.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {status === "completed" && (
              <Badge className="gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed Session
              </Badge>
            )}
            {status === "in_progress" && (
              <Badge className="gap-1.5 rounded-full border-primary/30 bg-primary/20 px-3 py-1 text-xs font-bold text-primary animate-pulse">
                <Play className="h-3.5 w-3.5 fill-current" /> Live Session
              </Badge>
            )}
            {(status === "in_progress" || status === "completed") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReset(true)}
                disabled={resetting}
                className="gap-1.5 rounded-xl text-xs text-muted-foreground hover:text-destructive border-border/60"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            {status === "completed" && !editMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
                className="gap-1.5 rounded-xl text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                Edit Logs
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar when in progress */}
        {status === "in_progress" && (
          <div className="mt-6 pt-5 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Session Progress</span>
                <span className="text-primary font-black">
                  {completedCount} of {entries.length} sets completed ({entries.length > 0 ? Math.round((completedCount / entries.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300 shadow-sm"
                  style={{ width: `${entries.length > 0 ? (completedCount / entries.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <Button
              onClick={handleComplete}
              disabled={completing || completedCount === 0}
              className="gap-2 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 shrink-0"
            >
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Complete Workout
            </Button>
          </div>
        )}
      </div>

      {(loading || loadingExercises) ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm font-medium">Loading session routine...</span>
        </div>
      ) : (
        <>
          {(status === "none" || status === "planned") && (
            <Card className="glass-card card-hover border-primary/30 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:p-8 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <Play className="h-7 w-7 fill-current ml-0.5" />
                </span>
                <div className="space-y-1 max-w-sm">
                  <h2 className="text-lg font-bold">Ready to Start Today&apos;s Workout?</h2>
                  <p className="text-xs text-muted-foreground">
                    Hit start to unlock live set logging, rest timers, and AI progressive overload recommendations.
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={starting}
                  size="lg"
                  className="gap-2 rounded-xl font-bold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 px-8"
                >
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  Start Workout
                </Button>
              </CardContent>
            </Card>
          )}
          <div className="space-y-6">
            {PHASE_ORDER.map(phase => {
              const secExercises = groupedExercises[phase]; if (!secExercises || secExercises.length === 0) return null;
              const meta = PHASE_META[phase] || { label: phase, color: "bg-muted text-muted-foreground" };
              const secEntries = entries.filter(e => e.phase === phase);
              const completedInSec = secEntries.filter(e => e.completed).length;
              const allDone = secEntries.length > 0 && completedInSec === secEntries.length;
              return (
                <CollapsibleSection key={phase} label={meta.label} color={meta.color} count={secExercises.length} completedCount={completedInSec} totalEntries={secEntries.length} defaultOpen={!allDone}>
                  <div className="space-y-3">
                    {secExercises.map((ex, idx) => {
                      const exerciseEntries = entries
                        .filter(e => e.exerciseName === ex.exerciseName && e.phase === phase)
                        .sort((a, b) => a.setNumber - b.setNumber);
                      return (
                        <DBExerciseLogCard
                          key={`${ex.id}-${idx}`}
                          exercise={ex}
                          index={idx}
                          entries={exerciseEntries}
                          canEdit={canEdit}
                          workoutId={workoutId}
                          onStartWorkout={handleStart}
                          onSave={handleSaveEntry}
                          onAddSet={() => handleAddSet(ex)}
                          onRemoveSet={handleRemoveSet}
                          onRegressSuccess={(newName, newTarget, newEquipment, newNotes) =>
                            handleRegressSuccess(ex.exerciseName, newName, newTarget, newEquipment, newNotes)
                          }
                        />
                      );
                    })}
                  </div>
                </CollapsibleSection>
              );
            })}
          </div>
          {status === "in_progress" && <div className="mt-8 flex justify-end"><Button onClick={handleComplete} disabled={completing || completedCount === 0} size="lg" className="gap-2">{completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Complete workout</Button></div>}
          {editMode && <div className="mt-8 flex justify-end gap-2"><Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button><Button onClick={() => setEditMode(false)} className="gap-1.5"><Save className="h-4 w-4" />Save & close</Button></div>}
        </>
      )}
      <AlertDialog open={showReset} onOpenChange={setShowReset}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset this workout?</AlertDialogTitle><AlertDialogDescription>This will clear all your logged data.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleReset} disabled={resetting} className="gap-1.5 bg-destructive text-white hover:bg-destructive/90">{resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}Yes, reset</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function CollapsibleSection({ label, color, count, completedCount, totalEntries, defaultOpen = true, children }: { label: string; color: string; count: number; completedCount: number; totalEntries: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const allDone = totalEntries > 0 && completedCount === totalEntries;
  const [open, setOpen] = React.useState(!allDone || defaultOpen);

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="mb-2 flex w-full items-center gap-2">
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide", color)}>{label}</span>
        <span className="text-xs text-muted-foreground">{completedCount > 0 ? <span className={allDone ? "text-emerald-600 dark:text-emerald-400" : ""}>{completedCount}/{totalEntries} done</span> : `${count} exercises`}</span>
        {allDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && children}
    </div>
  );
}

function DBExerciseLogCard({
  exercise,
  index,
  entries,
  canEdit,
  workoutId,
  onStartWorkout,
  onSave,
  onAddSet,
  onRemoveSet,
  onRegressSuccess,
}: {
  exercise: DBExercise;
  index: number;
  entries: LogEntry[];
  canEdit: boolean;
  workoutId: string | null;
  onStartWorkout: () => Promise<string | null>;
  onSave: (entryId: string, data: Partial<LogEntry>) => void;
  onAddSet: () => void;
  onRemoveSet: (entryId: string) => void;
  onRegressSuccess: (newName: string, newTarget: string, newEquipment?: string | null, newNotes?: string | null) => void;
}) {
  const allCompleted = entries.length > 0 && entries.every((e) => e.completed);
  const [expanded, setExpanded] = React.useState(!allCompleted);
  const [showRegressionModal, setShowRegressionModal] = React.useState(false);
  const [showDemoModal, setShowDemoModal] = React.useState(false);
  const [aiProgression, setAiProgression] = React.useState<AIProgressionResult | null>(null);
  const allDone = entries.length > 0 && entries.every(e => e.completed);
  const completedSets = entries.filter(e => e.completed).length;

  React.useEffect(() => {
    if (allDone) setExpanded(false);
    else if (canEdit) setExpanded(true);
  }, [canEdit, allDone]);

  React.useEffect(() => {
    fetch(`/api/training-workout/ai-progression?exerciseName=${encodeURIComponent(exercise.exerciseName)}&baselineTarget=${encodeURIComponent(exercise.repsOrDuration || "")}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setAiProgression(data))
      .catch(() => setAiProgression(null));
  }, [exercise.exerciseName, exercise.repsOrDuration]);

  const targetIsTime = !!(exercise.repsOrDuration && (
    exercise.repsOrDuration.toLowerCase().includes("sec") ||
    exercise.repsOrDuration.toLowerCase().includes("min") ||
    exercise.repsOrDuration.toLowerCase().includes("hold") ||
    exercise.repsOrDuration.toLowerCase().includes("hang") ||
    exercise.repsOrDuration.toLowerCase().includes("plank") ||
    exercise.repsOrDuration.toLowerCase().includes("sit") ||
    exercise.repsOrDuration.toLowerCase().includes("max")
  ));
  const targetIsReps = !targetIsTime;

  return (
    <Card className={cn("overflow-hidden transition-all", allDone && "border-emerald-500/30 bg-emerald-500/5")}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-tight">{exercise.exerciseName}</p>
              {allDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
              {entries.length > 0 && !allDone && <span className="text-[10px] font-medium text-muted-foreground">{completedSets}/{entries.length} sets</span>}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowDemoModal(true); }}
                className="ml-auto flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-600 transition-colors hover:bg-cyan-500/20 dark:text-cyan-400 shrink-0"
              >
                <Eye className="h-3 w-3" />
                Visual Demo
              </button>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
            </div>
            {!expanded && allDone && entries.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entries.map((e, i) => (
                  <span key={e.id}>{i > 0 && " · "}{e.actualReps && `${e.actualReps}r`}{e.actualTime && formatHumanTime(e.actualTime)}{e.actualWeight ? `@${e.actualWeight}kg` : ""}</span>
                ))}
              </p>
            )}
            {(expanded || !allDone) && (
              <>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>Sets: {exercise.sets}</span>
                  {exercise.repsOrDuration && <span>Target: <span className="font-medium text-foreground/70">{exercise.repsOrDuration}</span></span>}
                  {exercise.rest && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {exercise.rest}</span>}
                </div>
                {exercise.equipment && <p className="mt-0.5 text-xs text-muted-foreground">🏋️ {exercise.equipment}</p>}
                {exercise.coachingNotes && <p className="mt-1 text-xs italic text-muted-foreground">{exercise.coachingNotes}</p>}
              </>
            )}
          </div>
        </div>

        {/* Can't do this? Regress Skill button */}
        {!allDone && (
          <div className="mt-2.5 flex items-center justify-between border-t border-border/30 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowRegressionModal(true);
              }}
              className="h-7 gap-1.5 border-amber-500/30 bg-amber-500/10 px-2.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-500/20 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
            >
              <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
              Can&apos;t do this? Regress Skill
            </Button>
            <span className="text-[10px] font-medium text-muted-foreground">⚡ Tri-Phasic Motor Bridge</span>
          </div>
        )}

        {/* AI Progressive Overload Target Banner */}
        {expanded && aiProgression && aiProgression.hasHistory && (
          <div className="mt-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1.5 font-semibold text-purple-700 dark:text-purple-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Overload Goal: {aiProgression.aiTarget.displayText}
              </span>
              <Badge variant="outline" className="border-purple-500/40 bg-purple-500/15 text-[10px] text-purple-600 dark:text-purple-300">
                ⚡ {aiProgression.aiTarget.overloadText}
              </Badge>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {aiProgression.coachingTip}
            </p>
          </div>
        )}

        {canEdit && expanded && (
          <div className="mt-3 border-t border-border/30 pt-3 space-y-2">
            {entries.map((entry) => (
              <SetRow
                key={entry.id}
                entry={entry}
                targetIsReps={!!targetIsReps}
                targetIsTime={!!targetIsTime}
                aiTargetReps={aiProgression?.aiTarget?.targetReps ?? null}
                aiTargetTime={aiProgression?.aiTarget?.targetTime ?? null}
                onSave={onSave}
                onRemove={() => onRemoveSet(entry.id)}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onAddSet(); }}
              className="w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add Set
            </Button>
          </div>
        )}

        {!canEdit && entries.length > 0 && entries.some(e => e.actualReps || e.actualTime || e.actualWeight) && (
          <div className="mt-2 rounded-md bg-muted/50 p-2.5 text-xs space-y-1">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2">
                <span className="font-medium text-foreground/70">Set {entry.setNumber}:</span>
                {entry.actualReps && <span>{entry.actualReps} reps</span>}
                {entry.actualTime && <span>{entry.actualTime}s</span>}
                {entry.actualWeight != null && entry.actualWeight > 0 && <span>· {entry.actualWeight} kg</span>}
                {entry.notes && <span className="italic text-muted-foreground">— {entry.notes}</span>}
              </div>
            ))}
          </div>
        )}

        <SkillRegressionModal
          open={showRegressionModal}
          onOpenChange={setShowRegressionModal}
          exerciseName={exercise.exerciseName}
          phase={exercise.phase}
          workoutId={workoutId}
          onStartWorkout={onStartWorkout}
          onRegressSuccess={onRegressSuccess}
        />
        <ExerciseDemoModal
          open={showDemoModal}
          onOpenChange={setShowDemoModal}
          exerciseName={exercise.exerciseName}
        />
      </CardContent>
    </Card>
  );
}

function SkillRegressionModal({
  open,
  onOpenChange,
  exerciseName,
  phase,
  workoutId,
  onStartWorkout,
  onRegressSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  phase: string;
  workoutId: string | null;
  onStartWorkout: () => Promise<string | null>;
  onRegressSuccess: (newName: string, newTarget: string, newEquipment?: string | null, newNotes?: string | null) => void;
}) {
  const bridge = React.useMemo(() => getSkillRegression(exerciseName), [exerciseName]);
  const [activating, setActivating] = React.useState<string | null>(null);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customName, setCustomName] = React.useState("");
  const [customSets, setCustomSets] = React.useState("3");
  const [customTarget, setCustomTarget] = React.useState("8 reps");

  async function handleActivate(option: RegressionOption) {
    setActivating(option.name);
    try {
      let activeWorkoutId = workoutId;
      if (!activeWorkoutId) {
        activeWorkoutId = await onStartWorkout();
        if (!activeWorkoutId) {
          toast.error("Could not start workout session.");
          return;
        }
      }

      const res = await fetch("/api/training-workout/regress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: activeWorkoutId,
          originalExerciseName: exerciseName,
          newExerciseName: option.name,
          phase,
          targetReps: option.isTimeBased ? null : option.target,
          targetTime: option.isTimeBased ? option.target : null,
          equipment: option.equipment,
          notes: `Regressed from ${exerciseName} (${option.label}) — Tri-Phasic Motor Bridge`,
        }),
      });

      if (!res.ok) throw new Error("Regression failed");

      toast.success(`Swapped to ${option.name}! Build that motor pattern! 💪`);
      onRegressSuccess(option.name, option.target, option.equipment, option.notes);
      onOpenChange(false);
    } catch {
      toast.error("Could not regress exercise.");
    } finally {
      setActivating(null);
    }
  }

  async function handleCustomActivate() {
    if (!customName.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }
    setActivating("custom");
    try {
      let activeWorkoutId = workoutId;
      if (!activeWorkoutId) {
        activeWorkoutId = await onStartWorkout();
        if (!activeWorkoutId) return;
      }

      const res = await fetch("/api/training-workout/regress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: activeWorkoutId,
          originalExerciseName: exerciseName,
          newExerciseName: customName.trim(),
          phase,
          targetReps: customTarget.trim(),
          equipment: "Custom",
          notes: `Custom swap from ${exerciseName}`,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success(`Swapped to ${customName.trim()}! 💪`);
      onRegressSuccess(customName.trim(), customTarget.trim(), "Custom", `Custom replacement for ${exerciseName}`);
      onOpenChange(false);
    } catch {
      toast.error("Could not save custom replacement.");
    } finally {
      setActivating(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingDown className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base sm:text-lg">Tri-Phasic Skill Motor Bridge</DialogTitle>
              <DialogDescription className="text-xs">
                Target: <span className="font-semibold text-foreground">{exerciseName}</span> · {bridge.category}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Athletic Coaching Rationale */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-primary">⚡ Coach&apos;s Biomechanical Insight:</p>
          <p className="mt-0.5 text-[11px]">{bridge.rationale}</p>
        </div>

        {/* 3 Tri-Phasic Options */}
        <div className="space-y-3 pt-1">
          {/* 1. Angle Shift */}
          <div className="rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{bridge.options.angle.label}</span>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    RECOMMENDED BASE
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-primary">{bridge.options.angle.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  🎯 Target: <span className="font-medium text-foreground">{bridge.options.angle.sets} sets × {bridge.options.angle.target}</span> · 🏋️ {bridge.options.angle.equipment}
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">{bridge.options.angle.notes}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={() => handleActivate(bridge.options.angle)}
                disabled={activating !== null}
                className="gap-1.5 text-xs font-semibold"
              >
                {activating === bridge.options.angle.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                Activate Angle Shift
              </Button>
            </div>
          </div>

          {/* 2. Eccentric Negatives */}
          <div className="rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-purple-500/40 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{bridge.options.eccentric.label}</span>
                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                    CNS OVERLOAD
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-purple-600 dark:text-purple-400">{bridge.options.eccentric.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  🎯 Target: <span className="font-medium text-foreground">{bridge.options.eccentric.sets} sets × {bridge.options.eccentric.target}</span> · 🏋️ {bridge.options.eccentric.equipment}
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">{bridge.options.eccentric.notes}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleActivate(bridge.options.eccentric)}
                disabled={activating !== null}
                className="gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300"
              >
                {activating === bridge.options.eccentric.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                Activate Negatives
              </Button>
            </div>
          </div>

          {/* 3. Isometric Lock */}
          <div className="rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-blue-500/40 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{bridge.options.isometric.label}</span>
                  <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                    TENDON STABILITY
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">{bridge.options.isometric.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  🎯 Target: <span className="font-medium text-foreground">{bridge.options.isometric.sets} sets × {bridge.options.isometric.target}</span> · 🏋️ {bridge.options.isometric.equipment}
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">{bridge.options.isometric.notes}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleActivate(bridge.options.isometric)}
                disabled={activating !== null}
                className="gap-1.5 text-xs font-semibold"
              >
                {activating === bridge.options.isometric.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                Activate Static Hold
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Replacement Accordion */}
        <div className="border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={() => setCustomOpen(!customOpen)}
            className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span>Or choose a custom replacement exercise</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", customOpen && "rotate-180")} />
          </button>

          {customOpen && (
            <div className="mt-3 space-y-2.5 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Dumbbell Press, Resistance Band Push-Down"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-8 w-full rounded-md border border-border/40 bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-muted-foreground">Sets</label>
                  <input
                    type="text"
                    value={customSets}
                    onChange={(e) => setCustomSets(e.target.value)}
                    className="h-8 w-full rounded-md border border-border/40 bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-muted-foreground">Target (Reps or Time)</label>
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    className="h-8 w-full rounded-md border border-border/40 bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleCustomActivate}
                disabled={activating !== null}
                className="w-full gap-1.5 text-xs"
              >
                {activating === "custom" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Custom Exercise
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SetRow({ entry, targetIsReps, targetIsTime, aiTargetReps, aiTargetTime, onSave, onRemove }: {
  entry: LogEntry; targetIsReps: boolean; targetIsTime: boolean;
  aiTargetReps?: number | null;
  aiTargetTime?: number | null;
  onSave: (entryId: string, data: Partial<LogEntry>) => void;
  onRemove: () => void;
}) {
  const [reps, setReps] = React.useState(entry.actualReps?.toString() ?? "");
  const [weight, setWeight] = React.useState(entry.actualWeight?.toString() ?? "");
  const [timeSec, setTimeSec] = React.useState(entry.actualTime?.toString() ?? "");
  const [notes, setNotes] = React.useState(entry.notes ?? "");
  const [completed, setCompleted] = React.useState(entry.completed);
  const [saving, setSaving] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(!!entry.notes);

  React.useEffect(() => {
    setReps(entry.actualReps?.toString() ?? "");
    setWeight(entry.actualWeight?.toString() ?? "");
    setTimeSec(entry.actualTime?.toString() ?? "");
    setNotes(entry.notes ?? "");
    setCompleted(entry.completed);
  }, [entry.id, entry.actualReps, entry.actualWeight, entry.actualTime, entry.completed, entry.notes]);

  const parsedTimeSec = timeSec ? parseInt(timeSec) : null;
  const liveHumanTime = parsedTimeSec ? formatHumanTime(parsedTimeSec) : null;

  // Track if user changed values after the last save
  const isDirty = completed && (
    reps !== (entry.actualReps?.toString() ?? "") ||
    weight !== (entry.actualWeight?.toString() ?? "") ||
    parsedTimeSec !== (entry.actualTime ?? null) ||
    (notes.trim() || "") !== (entry.notes ?? "")
  );

  function handleSave() {
    setSaving(true);
    const parsedSec = timeSec ? parseInt(timeSec) : null;
    onSave(entry.id, {
      actualReps: targetIsReps ? (reps ? parseInt(reps) : (aiTargetReps ?? null)) : null,
      actualWeight: weight ? parseFloat(weight) : null,
      actualTime: targetIsTime ? (parsedSec ?? (aiTargetTime ?? null)) : null,
      notes: notes.trim() || null,
      completed: true,
    });
    setCompleted(true);
    setTimeout(() => setSaving(false), 500);
  }

  // Determine button label & style
  const buttonLabel = !completed ? "Save" : isDirty ? "Update" : "✓";
  const buttonVariant = !completed ? "default" : isDirty ? "default" : "outline";
  const buttonIcon = saving
    ? <Loader2 className="h-3 w-3 animate-spin" />
    : !completed ? <Save className="h-3 w-3" />
    : isDirty ? <Save className="h-3 w-3" />
    : <CheckCircle2 className="h-3 w-3" />;

  return (
    <div className={cn(
      "rounded-lg border p-2.5 transition-all",
      completed && !isDirty ? "border-emerald-500/30 bg-emerald-500/5" : isDirty ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-background"
    )}>
      <div className="flex items-center gap-2">
        <span className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          completed && !isDirty ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : isDirty ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"
        )}>
          {entry.setNumber}
        </span>

        <div className="flex flex-1 items-center gap-2">
          {targetIsReps && (
            <div className="flex-1 space-y-0.5">
              <label className="text-[9px] font-semibold uppercase text-muted-foreground">Reps</label>
              <input
                type="number"
                placeholder={aiTargetReps ? `${aiTargetReps} (AI)` : "—"}
                value={reps}
                onChange={e => setReps(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="h-8 w-full rounded-md border border-border/40 bg-background text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          {targetIsTime && (() => {
            const totalSec = timeSec ? parseInt(timeSec) || 0 : 0;
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;

            const handleTimeChange = (type: 'h' | 'm' | 's', val: string) => {
              const num = val ? parseInt(val) || 0 : 0;
              let newH = h, newM = m, newS = s;
              if (type === 'h') newH = num;
              if (type === 'm') newM = num;
              if (type === 's') newS = num;
              const newTotal = newH * 3600 + newM * 60 + newS;
              setTimeSec(newTotal > 0 ? newTotal.toString() : "");
            };

            return (
              <div className="flex-[1.5] space-y-0.5">
                <div className="flex items-center justify-between px-0.5">
                  <label className="text-[9px] font-semibold uppercase text-muted-foreground">Time (H:M:S)</label>
                  {aiTargetTime && !timeSec && <span className="text-[9px] font-medium text-purple-500">AI: {formatHumanTime(aiTargetTime)}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="h"
                    value={h > 0 ? h : ""}
                    onChange={e => handleTimeChange('h', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="h-8 w-full min-w-0 rounded-md border border-border/40 bg-background text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring px-1"
                  />
                  <span className="text-muted-foreground text-xs font-bold">:</span>
                  <input
                    type="number"
                    placeholder="m"
                    value={timeSec ? m : ""}
                    onChange={e => handleTimeChange('m', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="h-8 w-full min-w-0 rounded-md border border-border/40 bg-background text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring px-1"
                  />
                  <span className="text-muted-foreground text-xs font-bold">:</span>
                  <input
                    type="number"
                    placeholder="s"
                    value={timeSec ? s : ""}
                    onChange={e => handleTimeChange('s', e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="h-8 w-full min-w-0 rounded-md border border-border/40 bg-background text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring px-1"
                  />
                </div>
              </div>
            );
          })()}
          <div className="flex-1 space-y-0.5">
            <label className="text-[9px] font-semibold uppercase text-muted-foreground">Weight (kg)</label>
            <input
              type="number" step="0.5" placeholder="0" value={weight}
              onChange={e => setWeight(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="h-8 w-full rounded-md border border-border/40 bg-background text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
            className={cn("rounded p-1 text-muted-foreground transition-colors hover:text-foreground", showNotes && "text-primary")}
            title="Notes"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
          <Button
            size="sm" variant={buttonVariant as "default" | "outline"}
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            disabled={saving}
            className={cn("h-8 gap-1 px-2 text-xs", isDirty && "bg-amber-600 hover:bg-amber-700 text-white")}
          >
            {buttonIcon}
            {buttonLabel}
          </Button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
            title="Delete set"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-1.5 pl-8">
          <input
            type="text" placeholder="Notes for this set..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-7 w-full rounded-md border border-border/40 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
}

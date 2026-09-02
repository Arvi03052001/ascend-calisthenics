"use client";

import * as React from "react";
import {
  Dumbbell, Clock, CheckCircle2, Info, TrendingUp, ChevronDown,
  Play, Save, Loader2, RotateCcw, Trash2, Plus, ChevronLeft, ChevronRight, Calendar, AlertCircle, XCircle, Sparkles,
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
import { cn } from "@/lib/utils";

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

export function TrainingView() {
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [showChecklist, setShowChecklist] = React.useState(false);
  const [showRules, setShowRules] = React.useState(false);
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [weekStatusData, setWeekStatusData] = React.useState<{
    weekStartStr: string;
    formattedWeekRange: string;
    days: DayStatusInfo[];
  } | null>(null);
  const [loadingWeek, setLoadingWeek] = React.useState(true);

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

  if (selectedDay !== null && weekStatusData) {
    return (
      <DayDetail
        dayIndex={selectedDay}
        weekStartStr={weekStatusData.weekStartStr}
        dayDateFormatted={weekStatusData.days[selectedDay]?.formattedDate}
        onBack={() => {
          setSelectedDay(null);
          fetchWeekStatus();
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Dumbbell className="h-6 w-6 text-primary" />Weekly Plan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">6 days · Track progress · Mon to Sun week view</p>
        </div>

        {/* Week Date Picker Navigation */}
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-1.5 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setWeekOffset(prev => prev - 1)}
            title="Previous Week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{loadingWeek ? "Loading..." : weekStatusData?.formattedWeekRange}</span>
          </div>

          {weekOffset !== 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-[11px] font-medium"
              onClick={() => setWeekOffset(0)}
            >
              Today
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setWeekOffset(prev => prev + 1)}
            title="Next Week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Grid of 6 Days */}
      <div className="mb-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {DAY_INFO.map((dayInfo, idx) => {
          const statusInfo = weekStatusData?.days[idx];
          const status = statusInfo?.status ?? "upcoming";
          const isToday = statusInfo?.isToday ?? false;

          let cardBorderClass = "border-border/50 hover:border-border";
          let bgTint = "bg-card";

          if (status === "completed") {
            cardBorderClass = "border-emerald-500/40 dark:border-emerald-500/30";
            bgTint = "bg-emerald-500/5 dark:bg-emerald-950/20";
          } else if (status === "in_progress" || isToday) {
            cardBorderClass = "border-primary/50 shadow-sm";
            bgTint = "bg-primary/5";
          } else if (status === "missed") {
            cardBorderClass = "border-rose-500/30 dark:border-rose-500/20";
            bgTint = "bg-rose-500/5 dark:bg-rose-950/10";
          }

          return (
            <Card
              key={dayInfo.day}
              className={cn(
                "cursor-pointer border-2 transition-all hover:shadow-md",
                cardBorderClass,
                bgTint
              )}
              onClick={() => setSelectedDay(idx)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{dayInfo.day}</CardTitle>
                    {isToday && (
                      <Badge className="bg-primary px-1.5 py-0 text-[10px] font-bold text-primary-foreground">
                        TODAY
                      </Badge>
                    )}
                  </div>

                  {/* Status Badge */}
                  {status === "completed" && (
                    <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </Badge>
                  )}
                  {status === "in_progress" && (
                    <Badge className="gap-1 border-primary/30 bg-primary/15 text-[11px] font-semibold text-primary">
                      <Play className="h-3 w-3 fill-current" /> In Progress
                    </Badge>
                  )}
                  {status === "missed" && (
                    <Badge className="gap-1 border-rose-500/30 bg-rose-500/15 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      <XCircle className="h-3 w-3" /> Missed
                    </Badge>
                  )}
                  {status === "upcoming" && !isToday && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Upcoming
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{dayInfo.focus}</span>
                </div>

                {statusInfo?.formattedDate && (
                  <p className="mt-1 text-[11px] font-medium text-foreground/60">
                    🗓️ {statusInfo.formattedDate}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-3.5 w-3.5" />~18 exercises
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />~2 hours
                  </span>
                </div>
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

      <Card className="border-primary/20">
        <CardHeader className="cursor-pointer pb-2" onClick={() => setShowChecklist(!showChecklist)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-primary" />Foundation → Beginner Checklist
            </CardTitle>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showChecklist && "rotate-180")} />
          </div>
          <CardDescription>Your finish line. Master ALL before advancing.</CardDescription>
        </CardHeader>
        {showChecklist && (
          <CardContent className="pt-0">
            <div className="grid gap-2 sm:grid-cols-2">
              {FOUNDATION_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border/40 p-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-border/40" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.skill}</p>
                    <p className="text-xs text-muted-foreground">Target: {item.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
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

  async function handleStart() {
    setStarting(true);
    try {
      const res = await fetch("/api/training-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayIndex, weekStart: weekStartStr }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWorkoutId(data.workout.id); setEntries(data.workout.entries); setStatus("in_progress");
      toast.success("Workout started — log your sets below!");
    } catch { toast.error("Could not start workout."); } finally { setStarting(false); }
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
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <button onClick={onBack} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Back to week</button>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {dayInfo.day} {dayDateFormatted && <span className="text-lg font-normal text-muted-foreground">({dayDateFormatted})</span>}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dayInfo.focus}</p>
        </div>
        <div className="flex items-center gap-2">
          {status === "completed" && <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />Completed</Badge>}
          {status === "in_progress" && <Badge className="gap-1 bg-primary/15 text-primary"><Play className="h-3.5 w-3.5" />In progress</Badge>}
          {(status === "in_progress" || status === "completed") && <Button variant="outline" size="sm" onClick={() => setShowReset(true)} disabled={resetting} className="gap-1.5 text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" />Reset</Button>}
          {status === "completed" && !editMode && <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-1.5"><Save className="h-3.5 w-3.5" />Edit</Button>}
        </div>
      </div>
      {(loading || loadingExercises) ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          {(status === "none" || status === "planned") && (
            <Card className="mb-6 border-primary/20"><CardContent className="flex flex-col items-center gap-3 p-5 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Play className="h-6 w-6" /></span>
              <div><h2 className="text-base font-semibold">Ready to train?</h2><p className="mt-1 text-xs text-muted-foreground">Click start to open logging fields for each exercise below.</p></div>
              <Button onClick={handleStart} disabled={starting} size="lg" className="gap-2">{starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}Start workout</Button>
            </CardContent></Card>
          )}
          {status === "in_progress" && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <span className="text-sm text-muted-foreground">{completedCount}/{entries.length} logged</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${entries.length > 0 ? (completedCount / entries.length) * 100 : 0}%` }} /></div>
              <Button onClick={handleComplete} disabled={completing || completedCount === 0} size="sm" className="gap-1.5">{completing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Complete</Button>
            </div>
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
                          onSave={handleSaveEntry}
                          onAddSet={() => handleAddSet(ex)}
                          onRemoveSet={handleRemoveSet}
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
  const [open, setOpen] = React.useState(defaultOpen);
  const allDone = totalEntries > 0 && completedCount === totalEntries;
  React.useEffect(() => { if (allDone) setOpen(false); else setOpen(true); }, [allDone]);
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

function DBExerciseLogCard({ exercise, index, entries, canEdit, onSave, onAddSet, onRemoveSet }: {
  exercise: DBExercise; index: number; entries: LogEntry[]; canEdit: boolean;
  onSave: (entryId: string, data: Partial<LogEntry>) => void;
  onAddSet: () => void;
  onRemoveSet: (entryId: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
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

  const targetIsTime = exercise.repsOrDuration && (exercise.repsOrDuration.toLowerCase().includes("sec") || exercise.repsOrDuration.toLowerCase().includes("min") || exercise.repsOrDuration.toLowerCase().includes("hold"));
  const targetIsReps = exercise.repsOrDuration && !targetIsTime;

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
              <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
            </div>
            {!expanded && allDone && entries.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entries.map((e, i) => (
                  <span key={e.id}>{i > 0 && " · "}{e.actualReps && `${e.actualReps}r`}{e.actualTime && `${e.actualTime}s`}{e.actualWeight ? `@${e.actualWeight}kg` : ""}</span>
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
      </CardContent>
    </Card>
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

  // Track if user changed values after the last save
  const isDirty = completed && (
    reps !== (entry.actualReps?.toString() ?? "") ||
    weight !== (entry.actualWeight?.toString() ?? "") ||
    timeSec !== (entry.actualTime?.toString() ?? "") ||
    (notes.trim() || "") !== (entry.notes ?? "")
  );

  function handleSave() {
    setSaving(true);
    onSave(entry.id, {
      actualReps: reps ? parseInt(reps) : (aiTargetReps ?? null),
      actualWeight: weight ? parseFloat(weight) : null,
      actualTime: timeSec ? parseInt(timeSec) : (aiTargetTime ?? null),
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
          {targetIsTime && (
            <div className="flex-1 space-y-0.5">
              <label className="text-[9px] font-semibold uppercase text-muted-foreground">Time (sec)</label>
              <input
                type="number"
                placeholder={aiTargetTime ? `${aiTargetTime}s (AI)` : "—"}
                value={timeSec}
                onChange={e => setTimeSec(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="h-8 w-full rounded-md border border-border/40 bg-background text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
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

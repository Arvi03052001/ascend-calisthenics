"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Scale, Plus, Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type WeightLog = {
  id: string;
  weightKg: number;
  loggedAt: string;
  note: string | null;
};

type Profile = {
  startWeightKg?: number | null;
  targetWeightKg?: number | null;
  currentWeightKg?: number | null;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WeightLogView({ profile }: { profile: Profile | null }) {
  const [logs, setLogs] = React.useState<WeightLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [weight, setWeight] = React.useState("");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weight-logs?days=90", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setLogs(data.logs as WeightLog[]);
    } catch {
      toast.error("Could not load weight history.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w < 35 || w > 250) {
      toast.error("Enter a weight between 35 and 250 kg.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/weight-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: w, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to log weight");
      }
      toast.success(`Logged ${w} kg`);
      setWeight("");
      setNote("");
      await fetchLogs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log weight.");
    } finally {
      setSaving(false);
    }
  }

  const start = profile?.startWeightKg ?? null;
  const target = profile?.targetWeightKg ?? null;
  const current = logs.length ? logs[logs.length - 1].weightKg : profile?.currentWeightKg ?? null;

  // Delta since start
  const delta = start && current ? current - start : null;
  const deltaToGo = current && target ? current - target : null;

  const chartData = logs.map((l) => ({
    date: fmtDate(l.loggedAt),
    weight: l.weightKg,
    full: fmtFull(l.loggedAt),
  }));

  const yMin = logs.length
    ? Math.floor(Math.min(...logs.map((l) => l.weightKg), target ?? Infinity) - 2)
    : undefined;
  const yMax = logs.length
    ? Math.ceil(Math.max(...logs.map((l) => l.weightKg), start ?? 0) + 2)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm shadow-primary/15">
          <Scale className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Body Mass & Conditioning Trend
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Step on the scale, log daily weigh-ins, and watch your progression curve.
          </p>
        </div>
      </header>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatCard label="Current Weight" value={current ? `${current.toFixed(1)} kg` : "—"} accent />
        <StatCard label="Starting Baseline" value={start ? `${start.toFixed(1)} kg` : "—"} />
        <StatCard label="Target Goal" value={target ? `${target.toFixed(1)} kg` : "—"} />
        <StatCard
          label="Total Change"
          value={delta ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg` : "—"}
          tone={
            delta === null ? "neutral" : delta < 0 ? "good" : delta > 0 ? "bad" : "neutral"
          }
        />
      </div>

      {/* Chart */}
      <Card className="glass-card overflow-hidden border border-border/70 rounded-3xl shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4 px-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Transformation Trend</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">Rolling 90-day trajectory with target line</CardDescription>
            </div>
            {target && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                🎯 Target: {target} kg
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex h-[280px] items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm">Loading trend data...</span>
            </div>
          ) : chartData.length === 0 ? (
            <EmptyState
              title="No weigh-ins yet"
              body="Log your first weigh-in below to start generating your athletic transformation curve."
            />
          ) : (
            <div className="h-[280px] w-full text-muted-foreground">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 4, left: -10 }}>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.12} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    stroke="currentColor"
                    strokeOpacity={0.25}
                    minTickGap={20}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[yMin ?? "auto", yMax ?? "auto"]}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    stroke="currentColor"
                    strokeOpacity={0.25}
                    width={44}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(15,23,42,0.95)",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                      color: "#fff",
                      fontSize: 12,
                      padding: "8px 14px",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: 700 }}
                    itemStyle={{ color: "#10b981", fontWeight: 600 }}
                    formatter={(v: number) => [`${v} kg`, "Weight"]}
                    labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""}
                  />
                  {target && (
                    <ReferenceLine
                      y={target}
                      stroke="#10b981"
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{ value: `Goal: ${target}kg`, fontSize: 11, fill: "#10b981", position: "right", fontWeight: 600 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add form */}
      <Card className="glass-card border border-border/70 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4 px-6 sm:px-8">
          <CardTitle className="text-lg font-bold">Log Today&apos;s Weigh-In</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-0.5">Quickly record your current bodyweight</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-4">
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-[1.2fr_2fr_auto] items-end">
            <div className="space-y-1.5">
              <label htmlFor="weight" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Weight (kg)
              </label>
              <Input
                id="weight"
                inputMode="decimal"
                type="number"
                step="0.1"
                min={35}
                max={250}
                placeholder={current ? current.toFixed(1) : "75.0"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-12 rounded-xl text-base font-semibold border-border/60"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Optional Context / Notes
              </label>
              <Input
                id="note"
                type="text"
                placeholder="e.g. morning fasted, post-workout, creatine week 2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-12 rounded-xl text-sm border-border/60"
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 px-6 gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Log Weight
            </Button>
          </form>

          {/* Quick Increment Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">Quick Adjust:</span>
            {[-1.0, -0.5, +0.5, +1.0].map((adj) => (
              <Button
                key={adj}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg text-xs font-medium border-border/60 hover:bg-muted"
                onClick={() => {
                  const base = parseFloat(weight) || current || 75.0;
                  setWeight((base + adj).toFixed(1));
                }}
              >
                {adj > 0 ? `+${adj}` : adj} kg
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="glass-card border border-border/70 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/20 pb-4 px-6 sm:px-8">
          <CardTitle className="text-lg font-bold">Weigh-In History</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-0.5">Chronological record · last 90 days</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-28 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span className="text-xs font-medium">Loading history...</span>
            </div>
          ) : logs.length === 0 ? (
            <EmptyState title="Nothing logged yet" body="Your weigh-ins will show up here." />
          ) : (
            <ul className="max-h-96 divide-y divide-border/40 overflow-y-auto">
              {[...logs].reverse().map((l) => {
                const prevDelta = (() => {
                  const idx = logs.findIndex((x) => x.id === l.id);
                  if (idx <= 0) return null;
                  return l.weightKg - logs[idx - 1].weightKg;
                })();
                return (
                  <li key={l.id} className="flex items-center gap-4 px-6 sm:px-8 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-foreground">{l.weightKg.toFixed(1)} kg</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {fmtFull(l.loggedAt)}
                        {l.note ? ` · ${l.note}` : ""}
                      </p>
                    </div>
                    {prevDelta !== null && prevDelta !== 0 && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "gap-1 rounded-full text-xs font-bold",
                          prevDelta < 0
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                        )}
                      >
                        {prevDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {prevDelta > 0 ? "+" : ""}
                        {prevDelta.toFixed(1)} kg
                      </Badge>
                    )}
                    {prevDelta !== null && prevDelta === 0 && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  tone = "neutral",
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "neutral" | "good" | "bad";
}) {
  return (
    <div className={cn(
      "glass-card card-hover rounded-3xl border border-border/70 p-5 sm:p-6 transition-all",
      accent && "border-primary/40 shadow-md shadow-primary/10"
    )}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl sm:text-3xl font-black tracking-tight",
          accent && "text-primary",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "bad" && "text-orange-600 dark:text-orange-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

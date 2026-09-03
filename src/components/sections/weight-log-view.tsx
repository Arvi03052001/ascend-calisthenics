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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <Scale className="h-6 w-6 text-primary" />
          Weight log
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Step on the scale at the gym, log it here. Every entry moves your trend.
        </p>
      </header>

      {/* Stat row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Current" value={current ? `${current.toFixed(1)} kg` : "—"} accent />
        <StatCard label="Start" value={start ? `${start.toFixed(1)} kg` : "—"} />
        <StatCard label="Target" value={target ? `${target.toFixed(1)} kg` : "—"} />
        <StatCard
          label="Change"
          value={delta ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg` : "—"}
          tone={
            delta === null ? "neutral" : delta < 0 ? "good" : delta > 0 ? "bad" : "neutral"
          }
        />
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Trend</CardTitle>
          <CardDescription>Last 90 days · target line shown</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[260px] items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <EmptyState
              title="No weigh-ins yet"
              body="Log your first weight below to start your trend chart."
            />
          ) : (
            <div className="h-[260px] w-full text-muted-foreground">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.18} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    stroke="currentColor"
                    strokeOpacity={0.3}
                    minTickGap={20}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[yMin ?? "auto", yMax ?? "auto"]}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    stroke="currentColor"
                    strokeOpacity={0.3}
                    width={44}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid rgba(120,120,120,0.25)",
                      background: "rgba(20,20,20,0.92)",
                      color: "#fff",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#fff", fontWeight: 600 }}
                    itemStyle={{ color: "#10b981" }}
                    formatter={(v: number) => [`${v} kg`, "Weight"]}
                    labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ""}
                  />
                  {target && (
                    <ReferenceLine
                      y={target}
                      stroke="#10b981"
                      strokeDasharray="6 4"
                      label={{ value: `Target ${target}kg`, fontSize: 10, fill: "#10b981", position: "right" }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#10b981" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Log today&apos;s weight</CardTitle>
          <CardDescription>One entry per weigh-in. You can add a note too.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <div className="space-y-1.5">
              <label htmlFor="weight" className="text-xs font-medium text-muted-foreground">
                Weight (kg)
              </label>
              <Input
                id="weight"
                inputMode="decimal"
                type="number"
                step="0.1"
                min={35}
                max={250}
                placeholder={current ? current.toFixed(1) : "82.0"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="note" className="text-xs font-medium text-muted-foreground">
                Note (optional)
              </label>
              <Input
                id="note"
                placeholder="e.g. post-gym, fasted"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-11"
                maxLength={200}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="lg" disabled={saving} className="h-11 w-full sm:w-auto">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Log it</>}
              </Button>
            </div>
          </form>
          {deltaToGo !== null && deltaToGo > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{deltaToGo.toFixed(1)} kg</span> to go until your target.
            </p>
          )}
          {deltaToGo !== null && deltaToGo <= 0 && (
            <p className="mt-3 text-sm font-medium text-primary">
              Target reached. Time to set a new one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Most recent first · last 90 days</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-24 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState title="Nothing logged yet" body="Your weigh-ins will show up here." />
          ) : (
            <ul className="max-h-96 divide-y divide-border/60 overflow-y-auto">
              {[...logs].reverse().map((l) => {
                const prevDelta = (() => {
                  const idx = logs.findIndex((x) => x.id === l.id);
                  if (idx <= 0) return null;
                  return l.weightKg - logs[idx - 1].weightKg;
                })();
                return (
                  <li key={l.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{l.weightKg.toFixed(1)} kg</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {fmtFull(l.loggedAt)}
                        {l.note ? ` · ${l.note}` : ""}
                      </p>
                    </div>
                    {prevDelta !== null && prevDelta !== 0 && (
                      <Badge
                        variant="secondary"
                        className={
                          prevDelta < 0
                            ? "gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        }
                      >
                        {prevDelta < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {prevDelta > 0 ? "+" : ""}
                        {prevDelta.toFixed(1)}
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
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          "mt-1 text-lg font-semibold tracking-tight " +
          (accent ? "text-primary " : "") +
          (tone === "good" ? "text-emerald-600 dark:text-emerald-400 " : "") +
          (tone === "bad" ? "text-orange-600 dark:text-orange-400 " : "")
        }
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

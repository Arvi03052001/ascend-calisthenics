"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target, Activity, ArrowRight, Dumbbell } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Profile = {
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

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const EXPERIENCE = [
  {
    value: "rookie",
    label: "Rookie",
    desc: "Never trained. Can't do a pull-up yet.",
  },
  {
    value: "beginner",
    label: "Beginner",
    desc: "Some training. A few reps of basics.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "Comfortable with pull-ups & dips.",
  },
  {
    value: "advanced",
    label: "Advanced",
    desc: "Muscle-ups, levers, working skills.",
  },
];

export function Onboarding({
  name,
  onDone,
}: {
  name?: string | null;
  onDone?: (profile: Profile) => void;
}) {
  const router = useRouter();
  const [sex, setSex] = React.useState<string>("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [heightCm, setHeightCm] = React.useState("");
  const [startWeight, setStartWeight] = React.useState("");
  const [targetWeight, setTargetWeight] = React.useState("");
  const [experience, setExperience] = React.useState("rookie");
  const [trainingDays, setTrainingDays] = React.useState(4);
  const [goal, setGoal] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-calculate age from DOB for display
  const computedAge = React.useMemo(() => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age >= 0 && age <= 120 ? age : null;
  }, [dateOfBirth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      sex,
      dateOfBirth,
      heightCm,
      startWeightKg: startWeight,
      targetWeightKg: targetWeight,
      experienceLevel: experience,
      trainingDays,
      goal: goal.trim() || undefined,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Could not save your profile. Check the fields.");
        setLoading(false);
        return;
      }
      toast.success("Profile saved. Your journey starts now.");
      onDone?.(data.profile as Profile);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Target className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Let&apos;s set your baseline{name ? `, ${name}` : ""}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          A one-time setup so your AI coach, workouts and nutrition targets are
          built around <em className="not-italic font-medium text-foreground">you</em>.
          You can change any of this later.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your profile</CardTitle>
          <CardDescription>
            Honest numbers now mean honest progress later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Body basics */}
            <fieldset className="space-y-4">
              <legend className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 text-primary" />
                Body basics
              </legend>

              <div className="space-y-2">
                <Label>Sex</Label>
                <RadioGroup
                  value={sex}
                  onValueChange={setSex}
                  className="grid grid-cols-3 gap-2"
                >
                  {SEX_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        sex === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  {computedAge !== null && (
                    <p className="text-xs text-muted-foreground">
                      That makes you <span className="font-semibold text-primary">{computedAge}</span> years old
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    inputMode="numeric"
                    type="number"
                    min={120}
                    max={230}
                    placeholder="e.g. 175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            {/* Weight mission */}
            <fieldset className="space-y-4">
              <legend className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-primary" />
                Your weight mission
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="startWeight">Current weight (kg)</Label>
                  <Input
                    id="startWeight"
                    inputMode="decimal"
                    type="number"
                    step="0.1"
                    min={35}
                    max={250}
                    placeholder="e.g. 82"
                    value={startWeight}
                    onChange={(e) => setStartWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="targetWeight">Target weight (kg)</Label>
                  <Input
                    id="targetWeight"
                    inputMode="decimal"
                    type="number"
                    step="0.1"
                    min={35}
                    max={250}
                    placeholder="e.g. 75"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                  />
                </div>
              </div>
              {startWeight && targetWeight && Number(startWeight) > Number(targetWeight) && (
                <p className="text-sm text-muted-foreground">
                  That&apos;s a{" "}
                  <span className="font-semibold text-primary">
                    {(Number(startWeight) - Number(targetWeight)).toFixed(1)} kg
                  </span>{" "}
                  cut ahead of you. We&apos;ll pace it safely.
                </p>
              )}
            </fieldset>

            {/* Experience */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-sm font-medium">
                <Dumbbell className="h-4 w-4 text-primary" />
                Where are you starting from?
              </legend>
              <RadioGroup
                value={experience}
                onValueChange={setExperience}
                className="grid gap-2"
              >
                {EXPERIENCE.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      experience === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <RadioGroupItem value={opt.value} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>

            {/* Training frequency */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Training days per week</Label>
                <span className="text-sm font-semibold text-primary">
                  {trainingDays} {trainingDays === 1 ? "day" : "days"}
                </span>
              </div>
              <Slider
                value={[trainingDays]}
                onValueChange={(v) => setTrainingDays(v[0])}
                min={1}
                max={7}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>4 (sweet spot)</span>
                <span>7</span>
              </div>
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <Label htmlFor="goal">
                Your #1 goal{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="goal"
                rows={2}
                maxLength={160}
                placeholder="e.g. Do my first clean pull-up and get to 75 kg"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Save &amp; start training
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

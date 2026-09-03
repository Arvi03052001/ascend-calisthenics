"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Youtube, Dumbbell, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExerciseDemoData {
  found: boolean;
  dbName: string | null;
  name: string;
  level: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  imageUrls: string[];
  hasCustomAnimation: boolean;
  customAnimationKey: string | null;
  youtubeQuery: string;
}

interface ExerciseDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
}

// ─── Custom SVG Animations ─────────────────────────────────────────────────────

function PikePushUpAnimation() {
  return (
    <>
      <style>{`
        @keyframes pike-hips { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(18px)} }
        @keyframes pike-head { 0%,100%{transform:translate(0,0)} 50%{transform:translate(0,28px)} }
        @keyframes pike-left-arm { 0%,100%{transform-origin:70% 95%;transform:rotate(0deg)} 50%{transform-origin:70% 95%;transform:rotate(-28deg)} }
        @keyframes pike-right-arm { 0%,100%{transform-origin:30% 95%;transform:rotate(0deg)} 50%{transform-origin:30% 95%;transform:rotate(28deg)} }
        .pike-hips{animation:pike-hips 2.4s ease-in-out infinite}
        .pike-head{animation:pike-head 2.4s ease-in-out infinite}
        .pike-left-arm{animation:pike-left-arm 2.4s ease-in-out infinite}
        .pike-right-arm{animation:pike-right-arm 2.4s ease-in-out infinite}
      `}</style>
      <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Ground */}
        <line x1="10" y1="155" x2="230" y2="155" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
        {/* Feet */}
        <circle cx="60" cy="154" r="6" fill="#6366f1" />
        <circle cx="180" cy="154" r="6" fill="#6366f1" />
        {/* Hands */}
        <circle cx="90" cy="154" r="6" fill="#818cf8" />
        <circle cx="150" cy="154" r="6" fill="#818cf8" />
        {/* Legs - left */}
        <line x1="60" y1="154" x2="120" y2="68" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
        {/* Legs - right */}
        <line x1="180" y1="154" x2="120" y2="68" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
        {/* Hips joint */}
        <g className="pike-hips">
          <circle cx="120" cy="68" r="8" fill="#a5b4fc" />
        </g>
        {/* Arms - left */}
        <g className="pike-left-arm">
          <line x1="90" y1="154" x2="120" y2="108" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
        </g>
        {/* Arms - right */}
        <g className="pike-right-arm">
          <line x1="150" y1="154" x2="120" y2="108" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
        </g>
        {/* Head */}
        <g className="pike-head">
          <circle cx="120" cy="100" r="11" fill="#c7d2fe" />
          {/* Neck */}
          <line x1="120" y1="111" x2="120" y2="108" stroke="#c7d2fe" strokeWidth="3" />
        </g>
        {/* Motion arc hint */}
        <path d="M 108 88 Q 120 115 132 88" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.5" />
        {/* Label */}
        <text x="120" y="175" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">Pike Push-Up</text>
      </svg>
    </>
  );
}

function LSitAnimation() {
  return (
    <>
      <style>{`
        @keyframes lsit-legs { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        @keyframes lsit-body { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
        .lsit-legs{animation:lsit-legs 1.8s ease-in-out infinite}
        .lsit-body{animation:lsit-body 1.8s ease-in-out infinite}
      `}</style>
      <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Bars */}
        <rect x="60" y="100" width="8" height="55" rx="4" fill="#374151" />
        <rect x="172" y="100" width="8" height="55" rx="4" fill="#374151" />
        <rect x="50" y="94" width="28" height="10" rx="5" fill="#6366f1" />
        <rect x="162" y="94" width="28" height="10" rx="5" fill="#6366f1" />
        {/* Hands */}
        <circle cx="64" cy="99" r="6" fill="#818cf8" />
        <circle cx="176" cy="99" r="6" fill="#818cf8" />
        {/* Torso */}
        <g className="lsit-body">
          {/* Arms */}
          <line x1="64" y1="99" x2="96" y2="82" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
          <line x1="176" y1="99" x2="144" y2="82" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
          {/* Torso body */}
          <rect x="96" y="70" width="48" height="24" rx="8" fill="#6366f1" />
          {/* Head */}
          <circle cx="120" cy="56" r="12" fill="#c7d2fe" />
        </g>
        {/* Legs */}
        <g className="lsit-legs">
          <line x1="96" y1="85" x2="196" y2="82" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
          <circle cx="198" cy="82" r="6" fill="#818cf8" />
        </g>
        {/* Tension lines */}
        <line x1="96" y1="90" x2="96" y2="100" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.6" />
        <text x="120" y="175" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">L-Sit Hold</text>
      </svg>
    </>
  );
}

function HollowBodyAnimation() {
  return (
    <>
      <style>{`
        @keyframes hollow-rock { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes hollow-legs { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .hollow-rock{animation:hollow-rock 2s ease-in-out infinite;transform-origin:50% 50%}
        .hollow-legs{animation:hollow-legs 2s ease-in-out infinite}
      `}</style>
      <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Floor */}
        <line x1="10" y1="130" x2="230" y2="130" stroke="currentColor" strokeWidth="2" strokeOpacity="0.15" />
        <g className="hollow-rock">
          {/* Body */}
          <path d="M 40 105 Q 120 90 200 105" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
          {/* Head + shoulders lifted */}
          <circle cx="50" cy="97" r="12" fill="#c7d2fe" />
          {/* Arms overhead */}
          <line x1="50" y1="102" x2="28" y2="80" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="102" x2="22" y2="75" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
        </g>
        {/* Legs elevated */}
        <g className="hollow-legs">
          <line x1="200" y1="105" x2="228" y2="88" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
          <circle cx="229" cy="87" r="6" fill="#818cf8" />
        </g>
        {/* Lower back contact indicator */}
        <line x1="100" y1="110" x2="160" y2="110" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.5" />
        <text x="130" y="120" textAnchor="middle" fontSize="8" fill="#a5b4fc" opacity="0.7">Lower back pressed to floor</text>
        <text x="120" y="175" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">Hollow Body Hold</text>
      </svg>
    </>
  );
}

const CUSTOM_ANIMATIONS: Record<string, React.ComponentType> = {
  "pike-push-up": PikePushUpAnimation,
  "l-sit": LSitAnimation,
  "hollow-body": HollowBodyAnimation,
};

// ─── Image Crossfade Viewer ────────────────────────────────────────────────────

function ImageCrossfadeViewer({ urls }: { urls: string[] }) {
  const [frameIdx, setFrameIdx] = React.useState(0);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    if (urls.length < 2) return;
    const timer = setInterval(() => {
      setFrameIdx((i) => (i + 1) % urls.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [urls]);

  if (imgError || urls.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted/30">
        <div className="text-center text-xs text-muted-foreground">
          <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p>Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/20">
      {urls.map((url, i) => (
        <img
          key={url}
          src={url}
          alt={`Exercise position ${i + 1}`}
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
          style={{ opacity: i === frameIdx ? 1 : 0 }}
        />
      ))}
      {/* Frame indicator dots */}
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {urls.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === frameIdx ? "w-3 bg-primary" : "bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      )}
      <div className="absolute bottom-2 right-2 rounded-md bg-background/70 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground backdrop-blur-sm">
        {frameIdx === 0 ? "START" : "END"} position
      </div>
    </div>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const lower = level.toLowerCase();
  const colorClass = lower.includes("beginner")
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : lower.includes("advanced")
    ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
    : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold", colorClass)}>
      {level}
    </Badge>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ExerciseDemoModal({ open, onOpenChange, exerciseName }: ExerciseDemoModalProps) {
  const [data, setData] = React.useState<ExerciseDemoData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!open || !exerciseName) return;
    setData(null);
    setStep(0);
    setLoading(true);
    fetch(`/api/exercise-demo?name=${encodeURIComponent(exerciseName)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [open, exerciseName]);

  const CustomAnim = data?.customAnimationKey
    ? CUSTOM_ANIMATIONS[data.customAnimationKey]
    : null;

  const hasVisual = data && (data.imageUrls.length > 0 || data.hasCustomAnimation);
  const totalSteps = data?.instructions.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold leading-tight sm:text-lg">
                {exerciseName}
              </DialogTitle>
              {data && (
                <DialogDescription asChild>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <LevelBadge level={data.level} />
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Dumbbell className="h-2.5 w-2.5" />
                      {data.equipment}
                    </Badge>
                    {data.dbName && data.dbName !== exerciseName && (
                      <span className="text-[10px] text-muted-foreground">
                        via &ldquo;{data.dbName}&rdquo;
                      </span>
                    )}
                  </div>
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Visual Area */}
        <div className="mx-5 mb-4 h-52 sm:h-64 overflow-hidden rounded-xl border border-border/40 bg-muted/20">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && CustomAnim && (
            <div className="flex h-full items-center justify-center p-4 text-foreground">
              <CustomAnim />
            </div>
          )}
          {!loading && !CustomAnim && data && data.imageUrls.length > 0 && (
            <ImageCrossfadeViewer urls={data.imageUrls} />
          )}
          {!loading && !hasVisual && data && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Activity className="h-10 w-10 text-primary opacity-30" />
              <p className="text-xs text-muted-foreground">No visual demo available</p>
              <a
                href={data.youtubeQuery}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                Watch on YouTube →
              </a>
            </div>
          )}
        </div>

        {/* Muscle Tags */}
        {data && (data.primaryMuscles.length > 0 || data.secondaryMuscles.length > 0) && (
          <div className="px-5 mb-4 space-y-2">
            {data.primaryMuscles.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground w-16 shrink-0">Primary</span>
                {data.primaryMuscles.map((m) => (
                  <Badge key={m} variant="secondary" className="bg-primary/15 text-primary text-[10px] font-semibold">
                    {m}
                  </Badge>
                ))}
              </div>
            )}
            {data.secondaryMuscles.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground w-16 shrink-0">Secondary</span>
                {data.secondaryMuscles.map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px] text-muted-foreground">
                    {m}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Instructions */}
        {data && data.instructions.length > 0 && (
          <div className="px-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Step-by-Step Form</p>
              <span className="text-[10px] text-muted-foreground">{step + 1} / {totalSteps}</span>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-4 min-h-[80px] relative">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {step + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {data.instructions[step]}
                </p>
              </div>
            </div>
            {/* Step nav */}
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="h-7 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <div className="flex gap-1">
                {data.instructions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === step ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
                disabled={step === totalSteps - 1}
                className="h-7 gap-1 px-2.5 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer: YouTube */}
        {data && (
          <div className="border-t border-border/30 px-5 py-3.5">
            <a
              href={data.youtubeQuery}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff0000]/10 py-2.5 text-sm font-semibold text-[#cc0000] transition-colors hover:bg-[#ff0000]/20 dark:text-[#ff4444]"
            >
              <Youtube className="h-4 w-4" />
              Watch Tutorial on YouTube
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

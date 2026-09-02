"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Lock, Mail, User, ShieldCheck, Dumbbell, TrendingDown, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo, BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";
import { signInSchema, signUpSchema } from "@/lib/validators";

type Mode = "signin" | "signup";

const FEATURES = [
  {
    icon: Dumbbell,
    title: "Gym-friendly calisthenics",
    body: "Pull-up bars, dip stations, floor work — structured progression built for a real gym floor.",
  },
  {
    icon: TrendingDown,
    title: "Weight that follows you",
    body: "Log daily weight and meals. Watch the 82 → 75 kg trend move in the right direction.",
  },
  {
    icon: Sparkles,
    title: "An AI coach that knows you",
    body: "It reads your real logs — reps, weight, nutrition — and plans your next session accordingly.",
  },
];

export function AuthScreen({ onAuthed }: { onAuthed?: () => void }) {
  const [mode, setMode] = React.useState<Mode>("signin");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  function resetErrors() {
    setError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();

    const payload = mode === "signin"
      ? signInSchema.safeParse({ email, password })
      : signUpSchema.safeParse({ name, email, password });

    if (!payload.success) {
      const errs: Record<string, string> = {};
      for (const issue of payload.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload.data),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error ?? "Could not create your account. Try again.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: payload.data.email,
        password: payload.data.password,
        redirect: false,
      });

      if (!result || result.error || !result.ok) {
        const msg =
          mode === "signup"
            ? "Account created! Please sign in with your email and password."
            : "Wrong email or password. Double-check and try again.";
        setError(msg);
        toast.error(msg);
        if (mode === "signup") setMode("signin");
        setLoading(false);
        return;
      }

      // Success — session cookie is now set. Hard reload guarantees the
      // session is picked up (avoids the NextAuth CLIENT_FETCH_ERROR race
      // condition where useSession() can't see the new cookie immediately).
      toast.success(mode === "signup" ? "Account created! Welcome aboard." : "Welcome back!");
      // Small delay so the toast shows before reload
      setTimeout(() => {
        window.location.href = "/";
      }, 400);
      return;
    } catch (err) {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---------------- Brand / hero panel ---------------- */}
        <section className="relative hidden overflow-hidden bg-brand-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="bg-dot-pattern absolute inset-0 opacity-40" aria-hidden />
          <div className="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />

          <header className="relative z-10">
            <BrandLogo tone="light" className="text-white" markClassName="h-9 w-9" />
          </header>

          <div className="relative z-10 max-w-xl text-white">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Calisthenics · Conditioning · AI coaching
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
              From zero to your first pull-up.
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-white/80 xl:text-lg">
              Train calisthenics inside a regular gym, log every meal and weigh-in, and let a
              coach that actually reads your history plan the next step.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{f.title}</p>
                    <p className="text-sm text-white/70">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <footer className="relative z-10 text-xs text-white/60">
            Your data is tied to your account — sign in on any device, your history is right there.
          </footer>
        </section>

        {/* ---------------- Form panel ---------------- */}
        <section className="flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <BrandMark className="h-12 w-12" />
              <span className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                Ascend
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                Calisthenics · Conditioning · AI coaching
              </p>
            </div>

            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight">
                {mode === "signin" ? "Welcome back, athlete." : "Start your ascent."}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to pick up your training and logs where you left off."
                  : "Create your account — it takes less than a minute."}
              </p>
            </div>

            {/* Mode toggle — plain buttons for maximum reliability */}
            <div className="mb-6 grid w-full grid-cols-2 gap-1 rounded-lg bg-muted p-[3px]">
              <button
                type="button"
                onClick={() => { setMode("signin"); resetErrors(); }}
                className={cn(
                  "flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-all",
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); resetErrors(); }}
                className={cn(
                  "flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-all",
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Display name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        autoComplete="name"
                        placeholder="What should we call you?"
                        className="h-11 pl-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={!!fieldErrors.name}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-xs text-destructive">{fieldErrors.name}</p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!fieldErrors.email}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() =>
                          setError("Password reset is coming soon. For now, keep it safe.")
                        }
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
                      className="h-11 pl-9 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  ) : mode === "signup" ? (
                    <p className="text-xs text-muted-foreground">
                      Use 8+ characters. Mix in a number for strength.
                    </p>
                  ) : null}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
                  >
                    <span className="mt-0.5">!</span>
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="mt-2 h-11 w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign in" : "Create account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Switch link */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <>
                    New to Ascend?{" "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                      onClick={() => { setMode("signup"); resetErrors(); }}
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                      onClick={() => { setMode("signin"); resetErrors(); }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Encrypted passwords · Your data stays private to you</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

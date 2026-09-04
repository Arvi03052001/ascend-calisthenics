import { cn } from "@/lib/utils";

/**
 * Ascend brand mark — a stylised upward peak / "A" formed by two climbing
 * strokes, representing progression from rookie to pro. Pure SVG, inherits
 * currentColor so it adapts to light/dark and any surface.
 */
export function BrandMark({
  className,
  withRing = true,
}: {
  className?: string;
  withRing?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      {withRing && (
        <>
          <span className="absolute -inset-0.5 rounded-xl bg-primary/30 blur-sm" />
          <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 opacity-90 shadow-sm" />
        </>
      )}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn(
          "relative h-full w-full",
          withRing ? "p-1.5 text-black dark:text-zinc-950 drop-shadow-sm" : "text-primary"
        )}
        aria-hidden="true"
      >
        {/* left ascending stroke */}
        <path
          d="M6 25 L16 6"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* right descending stroke */}
        <path
          d="M16 6 L26 25"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity={withRing ? 0.8 : 0.85}
        />
        {/* crossbar (the rung you climb to) */}
        <path
          d="M10 18.5 L22 18.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* apex node */}
        <circle cx="16" cy="6" r="2.8" fill="currentColor" />
      </svg>
    </span>
  );
}

export function BrandLogo({
  className,
  markClassName,
  showWord = true,
  tone = "auto",
}: {
  className?: string;
  markClassName?: string;
  showWord?: boolean;
  /** "light" forces white wordmark (for dark hero panels) */
  tone?: "auto" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-3 group", className)}>
      <BrandMark className={cn("h-8 w-8 transition-transform group-hover:scale-105 duration-200", markClassName)} />
      {showWord && (
        <div className="flex flex-col -space-y-1">
          <span
            className={cn(
              "text-lg font-black tracking-tight font-sans uppercase",
              tone === "light" ? "text-white" : "text-foreground"
            )}
          >
            Ascend
          </span>
          <span className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase">
            Coach
          </span>
        </div>
      )}
    </span>
  );
}

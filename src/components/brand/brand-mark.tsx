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
    <span className={cn("relative inline-flex", className)}>
      {withRing && (
        <span className="absolute inset-0 rounded-[28%] bg-brand-gradient opacity-90" />
      )}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn(
          "relative h-full w-full",
          withRing ? "p-1.5 text-white" : "text-primary"
        )}
        aria-hidden="true"
      >
        {/* left ascending stroke */}
        <path
          d="M5 25.5 L16 6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* right descending stroke */}
        <path
          d="M16 6 L27 25.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={withRing ? 0.7 : 0.9}
        />
        {/* crossbar (the rung you climb to) */}
        <path
          d="M10.5 18.5 L21.5 18.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={withRing ? 0.85 : 0.8}
        />
        {/* apex node */}
        <circle cx="16" cy="6" r="2.6" fill="currentColor" />
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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-8 w-8", markClassName)} />
      {showWord && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            tone === "light" ? "text-white" : "text-foreground"
          )}
        >
          Ascend
        </span>
      )}
    </span>
  );
}

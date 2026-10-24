"use client";

import { restaurant } from "@/data/restaurant";
import { useNow } from "@/lib/hooks";
import { getOpenStatus } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** Live "Open now · pickup in ~20 min" chip. Renders a neutral placeholder until mounted. */
export function OpenStatus({ tone = "light", showLead = true, className }: { tone?: "light" | "dark"; showLead?: boolean; className?: string }) {
  const now = useNow();
  const status = now ? getOpenStatus(now) : null;

  return (
    <p
      className={cn(
        "inline-flex min-h-[2rem] items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        tone === "dark" ? "bg-cream/10 text-cream" : "bg-ink/[0.06] text-ink",
        className,
      )}
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        {status?.isOpen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mustard opacity-60" />}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", status?.isOpen ? "bg-mustard" : "bg-fog")} />
      </span>
      {status ? (
        <span>
          {status.label}
          {status.isOpen && showLead && <span className="opacity-75"> · pickup in ~{restaurant.pickupLeadMinutes} min</span>}
        </span>
      ) : (
        <span className="opacity-0">Checking the kitchen…</span>
      )}
    </p>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Thermal-paper order ticket with a torn bottom edge — HOT BUN's signature surface. */
export function Ticket({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "aside" }) {
  return (
    <Tag className={cn("relative drop-shadow-[0_14px_22px_rgba(31,25,21,0.16)]", className)}>
      <div className="ticket-edge bg-card px-5 pb-8 pt-5 font-mono text-[0.9rem] text-ink">{children}</div>
    </Tag>
  );
}

export function TicketHeader({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mb-3 text-center">
      <div className="text-xs uppercase tracking-[0.3em] text-muted">HOT BUN · Order ticket</div>
      <div className="mt-1 font-display text-xl font-semibold not-italic tracking-tight">{title}</div>
      {meta && <div className="mt-1 text-xs text-muted">{meta}</div>}
    </div>
  );
}

export function Perforation({ className }: { className?: string }) {
  return <div className={cn("perforation my-3", className)} aria-hidden />;
}

/** "Label ........ $12.00" row. */
export function TicketRow({ label, value, strong, className }: { label: ReactNode; value: ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2", strong && "text-base font-semibold", className)}>
      <span className="shrink-0">{label}</span>
      <span className="dotted-leader h-[1em] flex-1" aria-hidden />
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

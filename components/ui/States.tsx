import type { ReactNode } from "react";
import { RotateCcw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-line/60", className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-card/70 to-transparent" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-mustard shadow-pop-sm text-ink" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="font-display text-display-sm">{title}</h3>
      {children && <div className="mt-2 max-w-sm text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "The kitchen didn't answer",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-2xl border border-tomato/30 bg-tomato-tint/50 px-6 py-12 text-center", className)}>
      <WifiOff className="mb-4 h-8 w-8 text-tomato" aria-hidden />
      <h3 className="font-display text-display-sm">{title}</h3>
      {message && <p className="mt-2 max-w-md text-muted">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}

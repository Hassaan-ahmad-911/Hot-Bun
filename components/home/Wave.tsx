import { cn } from "@/lib/utils";

/** Wavy edge between sections (fills with currentColor). Static SVG, no runtime cost. */
export function Wave({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={cn("block h-6 w-full sm:h-10", flip && "rotate-180", className)}
      aria-hidden
    >
      <path d="M0 48V24C120 0 240 0 360 24s240 24 360 0 240-24 360 0 240 24 360 0v24Z" fill="currentColor" />
    </svg>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

/** The bun: domed top with sesame seeds, a patty, and the base. */
export function BunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={cn("h-9 w-10", className)} aria-hidden>
      <path d="M4 16C4 8.3 11.2 3 20 3s16 5.3 16 13H4Z" fill="currentColor" />
      <g className="fill-mustard">
        <ellipse cx="14" cy="9.5" rx="1.6" ry="1" transform="rotate(-20 14 9.5)" />
        <ellipse cx="21" cy="7.5" rx="1.6" ry="1" />
        <ellipse cx="27" cy="10" rx="1.6" ry="1" transform="rotate(20 27 10)" />
      </g>
      <rect x="2" y="19" width="36" height="5" rx="2.5" className="fill-tomato" />
      <path d="M5 27h30v1.5c0 2.5-2 4.5-4.5 4.5h-21C7 33 5 31 5 28.5V27Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2", tone === "light" ? "text-cream" : "text-ink", className)}
      aria-label="HOT BUN — home"
    >
      <BunMark className="transition-transform duration-300 ease-snap group-hover:-rotate-12 group-hover:scale-110" />
      <span className="font-display text-[1.65rem] uppercase leading-none tracking-tight">
        Hot<span className="ml-[0.12em] text-tomato">Bun</span>
      </span>
    </Link>
  );
}

"use client";

import { Fragment } from "react";
import { Marquee } from "@/components/motion/Kinetic";
import { cn } from "@/lib/utils";

const WORDS = ["Smash burgers", "Crispy chicken", "Loaded fries", "Thick shakes", "Hot sauce", "No freezers"];

function Burst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("mx-6 h-7 w-7 shrink-0", className)} aria-hidden>
      <path d="M12 0l2.6 7.4L22 4.6l-4.3 6.6L24 14l-7.4 1.6L18 24l-6-5-6 5 1.4-8.4L0 14l6.3-2.8L2 4.6l7.4 2.8z" fill="currentColor" />
    </svg>
  );
}

function Tape({ className, burstClass, velocity }: { className: string; burstClass: string; velocity: number }) {
  return (
    <div className={cn("border-y-2 border-ink py-3", className)}>
      <Marquee baseVelocity={velocity}>
        {WORDS.map((w) => (
          <Fragment key={w}>
            <span className="font-display text-3xl uppercase tracking-tight sm:text-5xl">{w}</span>
            <Burst className={burstClass} />
          </Fragment>
        ))}
      </Marquee>
    </div>
  );
}

/** Two crossed "tapes" that scroll in opposite directions and speed up with page scroll. */
export function TickerBands() {
  return (
    <div className="relative z-10 overflow-hidden py-10">
      <p className="sr-only">Smash burgers, crispy chicken, loaded fries and thick shakes — no freezers.</p>
      <Tape className="relative z-10 -rotate-2 bg-tomato text-white" burstClass="text-mustard" velocity={2.5} />
      <Tape className="absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-2 bg-mustard text-ink" burstClass="text-tomato" velocity={-2} />
    </div>
  );
}

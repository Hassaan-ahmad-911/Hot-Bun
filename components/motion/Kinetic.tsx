"use client";

import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_HEARTH } from "./Reveal";

/* ------------------------------------------------------------------ */
/* SplitText — words rise out of a mask, letter by letter or word by word */
/* ------------------------------------------------------------------ */

interface SplitTextProps {
  text: string;
  className?: string;
  /** Per-word class, e.g. to colour one word. Index → className */
  wordClass?: (word: string, index: number) => string | undefined;
  by?: "word" | "char";
  delay?: number;
  stagger?: number;
  /** Animate on mount (hero) or when scrolled into view. */
  trigger?: "mount" | "inView";
  /** Extra gate, e.g. wait for the intro to finish. */
  play?: boolean;
}

/**
 * Screen readers get the plain string via aria-label; the animated pieces are hidden.
 */
export function SplitText({ text, className, wordClass, by = "char", delay = 0, stagger, trigger = "inView", play: gate = true }: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const play = gate && (trigger === "mount" || inView);
  const words = text.split(" ");
  const step = stagger ?? (by === "char" ? 0.028 : 0.08);
  let charIndex = 0;

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className={cn("inline-block", wordClass?.(word, wi))}>
            {by === "word" ? (
              <motion.span
                className="inline-block"
                initial={{ y: "110%", rotate: 6 }}
                animate={play ? { y: "0%", rotate: 0 } : undefined}
                transition={{ duration: 0.9, delay: delay + wi * step, ease: EASE_HEARTH }}
              >
                {word}
              </motion.span>
            ) : (
              word.split("").map((ch, ci) => {
                const i = charIndex++;
                return (
                  <motion.span
                    key={ci}
                    className="inline-block"
                    initial={{ y: "115%", rotate: 12 }}
                    animate={play ? { y: "0%", rotate: 0 } : undefined}
                    transition={{ type: "spring", stiffness: 260, damping: 22, delay: delay + i * step }}
                  >
                    {ch}
                  </motion.span>
                );
              })
            )}
          </span>
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — element leans toward the cursor (fine pointers only)     */
/* ------------------------------------------------------------------ */

export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} className={cn("inline-block", className)} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt — 3D card tilt following the pointer                           */
/* ------------------------------------------------------------------ */

export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 200, damping: 18 });
  const ry = useSpring(0, { stiffness: 200, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={cn("[perspective:900px]", className)} onPointerMove={onMove} onPointerLeave={reset}>
      <motion.div className="h-full [transform-style:preserve-3d]" style={{ rotateX: rx, rotateY: ry }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — infinite ticker that speeds up (and reverses) with scroll */
/* ------------------------------------------------------------------ */

export function Marquee({ children, baseVelocity = 3, className }: { children: ReactNode; baseVelocity?: number; className?: string }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const direction = useRef(1);
  // Only run the ticker while it is on screen.
  const boxRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(boxRef);

  useAnimationFrame((_, delta) => {
    if (reduce || !onScreen) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    moveBy += direction.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div ref={boxRef} className={cn("overflow-hidden whitespace-nowrap", className)} aria-hidden>
      <motion.div className="flex w-max flex-nowrap will-change-transform" style={{ x }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0 items-center">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counter — counts up when scrolled into view                          */
/* ------------------------------------------------------------------ */

export function Counter({ to, decimals = 0, suffix = "", prefix = "", duration = 1.8 }: { to: number; decimals?: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  const format = (v: number) => `${prefix}${v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: EASE_HEARTH, onUpdate: setValue });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} aria-label={format(to)}>
      <span aria-hidden className="tabular-nums">
        {format(value)}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollProgress — thin bar across the top of the page                 */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[55] h-1 origin-left bg-tomato" style={{ scaleX }} aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Parallax — shifts its children as the section scrolls past          */
/* ------------------------------------------------------------------ */

export function Parallax({ children, offset = 80, className }: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const reduce = useReducedMotion();
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

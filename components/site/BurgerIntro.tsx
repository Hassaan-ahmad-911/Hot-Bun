"use client";

import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { INTRO_SEEN_KEY, useIntro } from "@/lib/store/intro";

/** Layer drop: falls from above and lands with a squashy spring. */
const drop = (delay: number, from = -420): { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition } => ({
  initial: { y: from, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { y: { type: "spring", stiffness: 420, damping: 22, delay }, opacity: { duration: 0.05, delay } },
});

const SEEDS = [
  [96, 62, -20], [122, 50, 10], [150, 46, -5], [178, 50, 15], [204, 60, -15],
  [110, 76, 25], [140, 66, 0], [168, 68, -25], [194, 78, 10], [158, 84, 20],
];

/** The burger, drawn in SVG so every layer can be animated (transform/opacity only). */
function AssemblingBurger() {
  return (
    <svg viewBox="0 0 300 300" className="h-[min(62vw,22rem)] w-[min(62vw,22rem)] overflow-visible" aria-hidden>
      {/* Plate shadow */}
      <motion.ellipse cx="150" cy="268" rx="120" ry="12" fill="#111" opacity={0.18} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }} style={{ transformOrigin: "150px 268px" }} />

      {/* Bottom bun */}
      <motion.g {...drop(0.1)}>
        <path d="M44 226h212v10c0 16-13 28-28 28H72c-15 0-28-12-28-28v-10Z" fill="#E8A13A" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      </motion.g>

      {/* Patty 1 — lands, then gets SMASHED (squash & stretch) */}
      <motion.g {...drop(0.35)}>
        <motion.g
          style={{ transformOrigin: "150px 216px" }}
          animate={{ scaleY: [1, 1, 0.55, 1.12, 1], scaleX: [1, 1, 1.14, 0.97, 1] }}
          transition={{ duration: 0.55, delay: 0.55, times: [0, 0.2, 0.45, 0.75, 1] }}
        >
          <rect x="38" y="200" width="224" height="28" rx="14" fill="#5A2E1B" stroke="#111" strokeWidth="5" />
          <path d="M60 210h30M120 214h40M190 209h34" stroke="#3B1D10" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
      </motion.g>
      {/* Sizzle lines on the smash */}
      {[-1, 1].map((side) => (
        <motion.g
          key={side}
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [0, 1, 0], x: side * 26 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          stroke="#111"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <path d={side < 0 ? "M28 200l-18-10M26 214H6M28 228l-18 10" : "M272 200l18-10M274 214h20M272 228l18 10"} />
        </motion.g>
      ))}

      {/* Cheese 1 — melts down (scaleY from the top) */}
      <motion.path
        d="M40 198h220l-20 0-8 22-14-22h-40l-10 30-12-30h-50l-9 18-9-18H62l-8 14z"
        fill="#FFC83D"
        stroke="#111"
        strokeWidth="5"
        strokeLinejoin="round"
        style={{ transformOrigin: "150px 198px" }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ scaleY: { type: "spring", stiffness: 200, damping: 12, delay: 0.95 }, opacity: { duration: 0.05, delay: 0.95 } }}
      />

      {/* Patty 2 + cheese 2 */}
      <motion.g {...drop(1.05)}>
        <rect x="42" y="170" width="216" height="28" rx="14" fill="#5A2E1B" stroke="#111" strokeWidth="5" />
        <path d="M70 180h36M140 184h30M196 179h30" stroke="#3B1D10" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
      <motion.path
        d="M44 168h212l-18 0-7 20-12-20h-44l-9 26-11-26H104l-8 16-8-16H64l-7 12z"
        fill="#FFC83D"
        stroke="#111"
        strokeWidth="5"
        strokeLinejoin="round"
        style={{ transformOrigin: "150px 168px" }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ scaleY: { type: "spring", stiffness: 200, damping: 12, delay: 1.3 }, opacity: { duration: 0.05, delay: 1.3 } }}
      />

      {/* Lettuce (offset group outside the animated element so Framer's transform doesn't replace it) */}
      <g transform="translate(0 12)">
        <motion.path
          {...drop(1.4)}
          d="M36 150c10-14 20 6 30-6s20 8 30-4 20 8 30-4 20 8 30-4 20 8 30-4 20 8 30-4 18 10 28 2l-6 12H42z"
          fill="#5BBF4A"
          stroke="#111"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>

      {/* Tomato */}
      <motion.g {...drop(1.58)}>
        <rect x="58" y="142" width="86" height="18" rx="9" fill="#D63A24" stroke="#111" strokeWidth="5" />
        <rect x="156" y="142" width="86" height="18" rx="9" fill="#D63A24" stroke="#111" strokeWidth="5" />
      </motion.g>

      {/* Top bun — falls from higher, bounces */}
      <motion.g
        initial={{ y: -560, opacity: 0, rotate: -8 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ y: { type: "spring", stiffness: 260, damping: 13, delay: 1.75 }, rotate: { type: "spring", stiffness: 200, damping: 10, delay: 1.75 }, opacity: { duration: 0.05, delay: 1.75 } }}
        style={{ transformOrigin: "150px 100px" }}
      >
        <g transform="translate(0 -8)">
          <path d="M40 138c0-58 50-102 110-102s110 44 110 102c0 6-5 10-11 10H51c-6 0-11-4-11-10Z" fill="#E8A13A" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
          <path d="M74 84c12-18 30-28 48-32" stroke="#FFD58A" strokeWidth="8" strokeLinecap="round" fill="none" />
          {SEEDS.map(([cx, cy, r], i) => (
            <g key={i} transform={`rotate(${r} ${cx} ${cy})`}>
              <motion.ellipse
                cx={cx}
                cy={cy}
                rx="6"
                ry="3.4"
                fill="#FFFDF7"
                stroke="#111"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 14, delay: 2.0 + i * 0.03 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            </g>
          ))}
        </g>
      </motion.g>

      {/* Steam */}
      {[110, 150, 190].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 26c-10-12 10-18 0-32`}
          stroke="#111"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.8, 0], y: [10, -14, -30] }}
          transition={{ duration: 1.4, delay: 2.35 + i * 0.15, repeat: Infinity, repeatDelay: 0.2 }}
        />
      ))}
    </svg>
  );
}

const WORD = "HOT BUN".split("");
const TOTAL_MS = 3100;

/**
 * First-visit intro: a burger assembles itself, the logo pops, and the
 * curtain lifts to reveal the site. Shown once per session; skippable;
 * never shown with reduced motion (gated before paint by an inline script).
 */
export function BurgerIntro() {
  const finish = useIntro((s) => s.finish);
  const [visible, setVisible] = useState(true);

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {}
    setVisible(false);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "skip") {
      setVisible(false);
      finish();
      return;
    }
    document.body.style.overflow = "hidden";
    const timer = setTimeout(close, TOTAL_MS);
    const skip = () => close();
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
    };
  }, [close, finish]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = "";
        finish();
      }}
    >
      {visible && (
        <motion.div
          id="burger-intro"
          key="intro"
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-mustard"
          onClick={close}
          exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          role="dialog"
          aria-label="HOT BUN — loading"
        >
          {/* Sunburst rays, slowly turning */}
          <div className="sunburst pointer-events-none absolute left-1/2 top-1/2 h-[180vmax] w-[180vmax] -translate-x-1/2 -translate-y-1/2" aria-hidden>
            <div className="h-full w-full animate-spin-slow rounded-full" />
          </div>
          <div className="relative flex flex-col items-center">
            <AssemblingBurger />
            <p className="mt-6 flex font-display text-[clamp(3rem,10vw,6rem)] uppercase leading-none" aria-hidden>
              {WORD.map((ch, i) => (
                <motion.span
                  key={i}
                  className={i > 3 ? "text-tomato text-pop-ink" : ""}
                  initial={{ y: 60, opacity: 0, rotate: 12 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18, delay: 2.0 + i * 0.05 }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </p>
            <motion.p
              className="mt-2 font-display text-lg font-extrabold uppercase tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.35 }}
            >
              Smashed to order
            </motion.p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute bottom-6 right-6 rounded-full border-2 border-ink bg-card px-4 py-2 font-display text-sm font-bold uppercase shadow-pop-sm transition-transform hover:-translate-y-0.5"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { DishImage } from "@/components/brand/DishImage";
import { Magnetic, SplitText } from "@/components/motion/Kinetic";
import { EASE_HEARTH } from "@/components/motion/Reveal";
import { AddToCart } from "@/components/menu/AddToCart";
import { OpenStatus } from "@/components/site/OpenStatus";
import { ButtonLink } from "@/components/ui/Button";
import { sitePhotos } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { formatPrice } from "@/lib/format";
import { useIntro } from "@/lib/store/intro";
import { useMenu } from "@/lib/store/menu";

/** Circular text sticker that spins forever (CSS transform animation). */
function SpinSticker({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="relative h-full w-full">
        <svg viewBox="0 0 120 120" className="h-full w-full animate-spin-slow">
          <defs>
            <path id="sticker-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <circle cx="60" cy="60" r="58" className="fill-mustard stroke-ink" strokeWidth="2.5" />
          <text className="fill-ink font-display text-[13px] font-extrabold uppercase tracking-[0.18em]">
            <textPath href="#sticker-circle">Fresh off the flat-top • Smashed to order •</textPath>
          </text>
        </svg>
        <Star className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 fill-tomato text-ink" />
      </div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { dishes, load } = useMenu();
  useEffect(() => void load(), [load]);
  const signature = dishes.find((d) => d.id === "hot-bun-og");
  // Entrance animations wait until the burger intro has lifted.
  const go = useIntro((s) => s.done);
  const on = <T,>(target: T) => (go ? target : undefined);

  // Scroll: the burger sinks, grows and twists as you leave the hero.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const burgerY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const burgerRotate = useTransform(scrollYProgress, [0, 1], [0, -12]);
  const burgerScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const floatY = useTransform(scrollYProgress, [0, 1], [0, -220]);

  // Pointer: layered parallax for depth (desktop mouse only).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const nearX = useTransform(sx, (v) => v * 28);
  const nearY = useTransform(sy, (v) => v * 28);
  const farX = useTransform(sx, (v) => v * -14);
  const farY = useTransform(sy, (v) => v * -14);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+1.5rem)] lg:pb-24 lg:pt-[calc(var(--header-h)+2.5rem)]"
      aria-labelledby="hero-title"
    >
      {/* Diner sunburst behind the burger (static — a spinning gradient this size costs frames while scrolling). */}
      <motion.div
        className="sunburst pointer-events-none absolute -right-32 top-[36rem] h-[26rem] w-[26rem] overflow-hidden rounded-full border-[3px] border-ink sm:top-[30rem] sm:h-[36rem] sm:w-[36rem] lg:-right-24 lg:top-6 lg:h-[46rem] lg:w-[46rem]"
        style={{ x: farX, y: farY }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={on({ scale: 1, opacity: 1 })}
        transition={{ duration: 1.2, ease: EASE_HEARTH }}
        aria-hidden
      >
        <div className="absolute inset-0 rounded-full" />
      </motion.div>

      <div className="container relative grid items-center gap-10 lg:grid-cols-12">
        <div className="relative z-10 lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={on({ opacity: 1, y: 0 })} transition={{ duration: 0.5 }}>
            <OpenStatus className="border-2 border-ink bg-card shadow-pop-sm" />
          </motion.div>

          <h1 id="hero-title" className="mt-6 font-display text-display-xl uppercase">
            <SplitText text="Smashed." trigger="mount" play={go} delay={0.15} className="block" />
            <SplitText text="Stacked." trigger="mount" play={go} delay={0.4} className="block text-tomato" />
            <SplitText text="Sauced." trigger="mount" play={go} delay={0.65} className="block text-pop" />
          </h1>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={on({ opacity: 1, y: 0 })} transition={{ duration: 0.7, delay: 0.95, ease: EASE_HEARTH }}>
            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed text-muted sm:text-xl">
              Double-smashed patties with crazy-crispy edges, Nashville hot chicken and spoon-thick shakes. Ready for pickup in
              about {restaurant.pickupLeadMinutes} minutes.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Magnetic>
                <ButtonLink href="/menu" size="lg" className="group w-full sm:w-auto">
                  Order online
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/reservations" variant="secondary" size="lg" className="w-full sm:w-auto">
                  Book a booth
                </ButtonLink>
              </Magnetic>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-mustard text-ink" aria-hidden />
                ))}
              </div>
              <p className="text-sm font-semibold">
                4.9 from 2,300+ reviews <span className="text-muted">· sample rating</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Burger stage */}
        <div className="relative mx-auto aspect-square w-full max-w-[34rem] lg:col-span-5 lg:max-w-none">
          <motion.div className="absolute inset-[6%]" style={reduce ? undefined : { y: burgerY, rotate: burgerRotate, scale: burgerScale }}>
            <motion.div
              className="h-full w-full"
              style={{ x: nearX, y: nearY }}
              initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
              animate={on({ scale: 1, rotate: 0, opacity: 1 })}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.25 }}
            >
              <DishImage
                name="The Hot Bun OG — double smash burger"
                category="burgers"
                src={sitePhotos.heroBurger}
                shape="circle"
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="h-full w-full border-[3px] border-ink shadow-pop-lg"
              />
            </motion.div>
          </motion.div>

          <SpinSticker className="absolute -left-2 top-0 h-28 w-28 sm:h-32 sm:w-32" />

          {/* Floating polaroids */}
          <motion.div className="absolute -right-2 top-[8%] w-28 sm:w-36" style={reduce ? undefined : { y: floatY }}>
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 20 }}
              animate={on({ opacity: 1, y: 0, rotate: 8 })}
              transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.7 }}
              className="animate-float rounded-xl border-2 border-ink bg-card p-1.5 shadow-pop"
            >
              <DishImage name="Shoestring fries" category="sides" src={sitePhotos.heroFries} className="aspect-square w-full rounded-lg" sizes="150px" />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -bottom-4 left-[4%] z-10 w-[88%] sm:left-[-6%] sm:w-[80%]"
            initial={{ opacity: 0, y: 40 }}
            animate={on({ opacity: 1, y: 0 })}
            transition={{ type: "spring", stiffness: 140, damping: 16, delay: 1.05 }}
          >
            <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-pop">
              <div ref={plateRef} className="h-16 w-16 shrink-0">
                <DishImage name="The Hot Bun OG" category="burgers" src={signature?.image ?? sitePhotos.heroBurger} shape="circle" className="h-full w-full border-2 border-ink" sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-tomato">Most ordered</p>
                <p className="truncate font-display text-lg leading-tight">The Hot Bun OG</p>
                <p className="font-mono text-sm font-semibold">{formatPrice(signature?.price ?? 1500)}</p>
              </div>
              {signature ? <AddToCart dish={signature} sourceRef={plateRef} /> : <span className="h-11 w-20 rounded-full bg-line" aria-hidden />}
            </div>
          </motion.div>

          <motion.span
            className="absolute bottom-[22%] right-0 z-10 rounded-full border-2 border-ink bg-tomato px-4 py-2 font-display text-sm font-extrabold uppercase text-white shadow-pop"
            style={{ rotate: 6 }}
            initial={{ scale: 0 }}
            animate={on({ scale: 1 })}
            transition={{ type: "spring", stiffness: 400, damping: 12, delay: 1.25 }}
            aria-hidden
          >
            <span className="inline-block animate-wobble">{restaurant.pickupLeadMinutes}-min pickup</span>
          </motion.span>
        </div>
      </div>
    </section>
  );
}

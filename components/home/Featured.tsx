"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DishCard, DishCardSkeleton } from "@/components/menu/DishCard";
import { SplitText } from "@/components/motion/Kinetic";
import { ErrorState } from "@/components/ui/States";
import { useMediaQuery } from "@/lib/hooks";
import { useMenu } from "@/lib/store/menu";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function Heading({ compact }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="inline-block -rotate-2 rounded-full border-2 border-ink bg-mustard px-3 py-1 font-display text-sm font-extrabold uppercase shadow-pop-sm">
          The hit list
        </p>
        <h2 id="featured-title" className={`mt-4 font-display uppercase ${compact ? "text-display-md" : "text-display-lg"}`}>
          <SplitText text="What everyone's ordering." by="word" />
        </h2>
      </div>
      <Link
        href="/menu"
        className="group inline-flex items-center gap-2 self-start font-display text-lg font-bold underline decoration-tomato decoration-[3px] underline-offset-8 md:self-auto"
      >
        Full menu
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>
    </div>
  );
}

/**
 * Desktop: the section pins and the cards slide sideways as you scroll down.
 * Mobile / reduced motion: a native swipeable row.
 */
export function Featured() {
  const { dishes, status, error, load } = useMenu();
  useEffect(() => void load(), [load]);
  const featured = dishes.filter((d) => d.featured).slice(0, 6);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const pinned = wide && !reduce;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useIsoLayoutEffect(() => {
    if (!pinned || !trackRef.current) return;
    const measure = () => setDistance(Math.max(0, (trackRef.current?.scrollWidth ?? 0) - window.innerWidth + 80));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned, status, featured.length]);

  const cards =
    status === "ready"
      ? featured.map((dish, i) => (
          <div key={dish.id} className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-[21rem]">
            <DishCard dish={dish} variant={!pinned && i % 3 === 0 ? "feature" : "default"} />
          </div>
        ))
      : Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-[80%] shrink-0 sm:w-[46%] lg:w-[21rem]">
            <DishCardSkeleton feature={!pinned && i % 3 === 0} />
          </div>
        ));

  if (status === "error") {
    return (
      <section ref={sectionRef} className="container py-20" aria-labelledby="featured-title">
        <Heading />
        <ErrorState className="mt-12" message={error ?? undefined} onRetry={() => load({ force: true })} />
      </section>
    );
  }

  if (!pinned) {
    return (
      <section ref={sectionRef} className="py-20" aria-labelledby="featured-title">
        <div className="container">
          <Heading />
        </div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-2 sm:px-6" aria-busy={status !== "ready"}>
          {cards}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }} aria-labelledby="featured-title">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-[calc(var(--header-h)+1rem)]">
        <div className="container">
          <Heading compact />
        </div>
        <motion.div ref={trackRef} className="mt-8 flex w-max gap-7 pl-[max(2.5rem,calc((100vw-1360px)/2+2.5rem))] pr-10 pt-2" style={{ x }} aria-busy={status !== "ready"}>
          {cards}
        </motion.div>
        {/* Scroll progress for the gallery */}
        <div className="container mt-8">
          <div className="h-2 overflow-hidden rounded-full border-2 border-ink bg-card">
            <motion.div className="h-full origin-left bg-tomato" style={{ scaleX: progress }} />
          </div>
        </div>
      </div>
    </section>
  );
}

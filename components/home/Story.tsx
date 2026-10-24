"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { DishImage } from "@/components/brand/DishImage";
import { Parallax, SplitText } from "@/components/motion/Kinetic";
import { Reveal } from "@/components/motion/Reveal";
import { sitePhotos } from "@/data/menu";

/**
 * Story: the grill photo zooms out as you scroll while a tomato panel wipes off it,
 * with a parallax collage of photos alongside.
 */
export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const wipe = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const reduce = useReducedMotion();

  return (
    <section id="story" className="relative overflow-hidden py-20 lg:py-28" aria-labelledby="story-title">
      <div className="container grid items-center gap-14 lg:grid-cols-12">
        <div ref={ref} className="relative lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-[3px] border-ink shadow-pop-lg">
            <motion.div className="absolute inset-0" style={reduce ? undefined : { scale }}>
              <DishImage name="Our grill cook smashing patties on the flat-top" category="burgers" src={sitePhotos.grillChef} className="h-full w-full rounded-none" sizes="(min-width: 1024px) 45vw, 100vw" />
            </motion.div>
            {!reduce && <motion.div className="absolute inset-0 origin-top bg-tomato" style={{ scaleY: wipe }} aria-hidden />}
          </div>
          <Parallax offset={60} className="absolute -bottom-10 -right-4 w-40 sm:w-52">
            <div className="rotate-6 rounded-2xl border-2 border-ink bg-card p-2 shadow-pop">
              <DishImage name="A tray of sliders" category="burgers" src={sitePhotos.sliders} className="aspect-square w-full rounded-xl" sizes="220px" />
              <p className="mt-2 text-center font-display text-sm font-extrabold uppercase">Slider Friday</p>
            </div>
          </Parallax>
          <span className="absolute -left-3 -top-5 -rotate-6 rounded-full border-2 border-ink bg-mustard px-4 py-2 font-display font-extrabold uppercase shadow-pop">
            Est. 2016
          </span>
        </div>

        <div className="lg:col-span-6 lg:pl-6">
          <p className="inline-block -rotate-2 rounded-full border-2 border-ink bg-tomato px-3 py-1 font-display text-sm font-extrabold uppercase text-white shadow-pop-sm">
            Our story
          </p>
          <h2 id="story-title" className="mt-4 font-display text-display-lg uppercase">
            <SplitText text="Born on a flat-top." by="word" />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg font-medium leading-relaxed text-muted">
              HOT BUN started as a weekend pop-up with one griddle, a borrowed tent and a line around the block. Jess Ramos had one
              rule: smash it hard, smash it fresh, and never, ever freeze a patty.
            </p>
            <p className="mt-4 text-lg font-medium leading-relaxed text-muted">
              Eight years later we grind our beef every morning, brine our chicken for 24 hours and hand-cut every fry. The tent
              is gone. The line isn&apos;t.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <blockquote className="relative mt-10 rounded-2xl border-2 border-ink bg-mustard p-6 shadow-pop">
              <p className="font-display text-2xl uppercase leading-tight">
                &ldquo;If the edges aren&apos;t crispy, it isn&apos;t smashed. It&apos;s just a burger.&rdquo;
              </p>
              <footer className="mt-3 font-semibold">Jess Ramos, founder &amp; head griddler</footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

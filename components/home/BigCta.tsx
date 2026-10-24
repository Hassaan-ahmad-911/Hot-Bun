"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { DishImage } from "@/components/brand/DishImage";
import { Magnetic } from "@/components/motion/Kinetic";
import { ButtonLink } from "@/components/ui/Button";
import { sitePhotos } from "@/data/menu";
import { Wave } from "./Wave";

/** Closing band: giant words slide in from opposite sides as you scroll, with photos orbiting. */
export function BigCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const left = useTransform(scrollYProgress, [0, 0.6], ["-30%", "0%"]);
  const right = useTransform(scrollYProgress, [0, 0.6], ["30%", "0%"]);
  const spin = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  return (
    <div>
      <Wave className="-mb-px text-tomato" />
      <section ref={ref} className="on-dark relative overflow-hidden bg-tomato py-24 text-white lg:py-32" aria-labelledby="cta-title">
        <motion.div className="pointer-events-none absolute -left-10 top-10 hidden w-48 md:block" style={reduce ? undefined : { rotate: spin }} aria-hidden>
          <DishImage name="" category="shakes" src={sitePhotos.heroShake} shape="circle" className="aspect-square w-full border-[3px] border-ink shadow-pop-lg" sizes="200px" />
        </motion.div>
        <motion.div className="pointer-events-none absolute -right-8 bottom-8 hidden w-56 md:block" style={reduce ? undefined : { rotate: spin }} aria-hidden>
          <DishImage name="" category="burgers" src={sitePhotos.burgerFries} shape="circle" className="aspect-square w-full border-[3px] border-ink shadow-pop-lg" sizes="230px" />
        </motion.div>

        <div className="container relative text-center">
          <h2 id="cta-title" className="font-display text-display-xl uppercase">
            <motion.span className="block" style={reduce ? undefined : { x: left }}>
              Hungry
            </motion.span>
            <motion.span className="block text-mustard" style={reduce ? undefined : { x: right }}>
              yet?
            </motion.span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-xl font-semibold">Your burger is about 15 minutes away. Probably less.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Magnetic strength={0.5}>
              <ButtonLink href="/menu" variant="light" size="lg" className="group">
                Order online <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </ButtonLink>
            </Magnetic>
            <Magnetic strength={0.5}>
              <ButtonLink href="/reservations" variant="outline-light" size="lg">
                Book a booth
              </ButtonLink>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}

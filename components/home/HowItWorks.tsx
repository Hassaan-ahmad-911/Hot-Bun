"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, MousePointerClick, ShoppingBag } from "lucide-react";
import { Magnetic, SplitText } from "@/components/motion/Kinetic";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Tap what you crave",
    body: "Burgers, chicken, fries, shakes. Everything lands on your ticket in one tap.",
    icon: MousePointerClick,
    className: "bg-mustard",
    rotate: -3,
  },
  {
    n: "02",
    title: "Pickup or delivery",
    body: "ASAP or a time that suits. Every fee is shown before you pay. No surprises.",
    icon: ShoppingBag,
    className: "bg-card",
    rotate: 2,
  },
  {
    n: "03",
    title: "We smash it fresh",
    body: "Watch it go from Received to On the grill to Ready, live. Hot when it hits your hands.",
    icon: Flame,
    className: "bg-tomato text-white",
    rotate: -2,
  },
];

export function HowItWorks() {
  return (
    <section className="halftone relative overflow-hidden py-20 lg:py-28" aria-labelledby="how-title">
      <div className="container">
        <div className="max-w-3xl">
          <p className="inline-block rotate-2 rounded-full border-2 border-ink bg-card px-3 py-1 font-display text-sm font-extrabold uppercase shadow-pop-sm">
            How it works
          </p>
          <h2 id="how-title" className="mt-4 font-display text-display-lg uppercase">
            <SplitText text="Three taps to dinner." by="word" />
          </h2>
          <p className="mt-4 max-w-xl text-lg font-medium text-muted">
            Order direct and it goes straight to our grill, not through an app that takes a cut. Same food, better price.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 80, rotate: s.rotate * 3 }}
                whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
                whileHover={{ rotate: 0, y: -8 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ type: "spring", stiffness: 150, damping: 15, delay: i * 0.12 }}
                className={cn("rounded-[1.75rem] border-2 border-ink p-7 shadow-pop-lg", s.className)}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-7xl leading-none">{s.n}</span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-8 font-display text-3xl uppercase leading-none">{s.title}</h3>
                <p className="mt-3 text-[1.05rem] font-medium leading-relaxed">{s.body}</p>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-12 flex justify-center">
          <Magnetic>
            <ButtonLink href="/menu" size="lg" className="group">
              Start an order <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </ButtonLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
